#!/usr/bin/env python3

import psycopg2
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def safe_cleanup_broker_duplicates():
    """Safely clean up duplicate broker records by updating foreign key references first"""
    
    logger.info("Starting SAFE broker duplicate cleanup...")
    
    conn = psycopg2.connect(
        dbname='indusun',
        user='postgres',
        password='1234',
        host='localhost',
        port=5432
    )
    
    try:
        with conn.cursor() as cursor:
            
            # First, let's see what we're working with
            cursor.execute("SELECT COUNT(*) FROM brokers")
            initial_count = cursor.fetchone()[0]
            logger.info(f"Initial broker count: {initial_count}")
            
            # Check what tables reference brokers
            cursor.execute("""
                SELECT 
                    tc.table_name, 
                    kcu.column_name,
                    ccu.table_name AS foreign_table_name,
                    ccu.column_name AS foreign_column_name 
                FROM 
                    information_schema.table_constraints AS tc 
                    JOIN information_schema.key_column_usage AS kcu
                      ON tc.constraint_name = kcu.constraint_name
                      AND tc.table_schema = kcu.table_schema
                    JOIN information_schema.constraint_column_usage AS ccu
                      ON ccu.constraint_name = tc.constraint_name
                      AND ccu.table_schema = tc.table_schema
                WHERE tc.constraint_type = 'FOREIGN KEY' 
                  AND ccu.table_name = 'brokers'
            """)
            
            foreign_keys = cursor.fetchall()
            logger.info(f"Tables that reference brokers:")
            for table, column, foreign_table, foreign_column in foreign_keys:
                logger.info(f"  {table}.{column} -> {foreign_table}.{foreign_column}")
            
            # Find all duplicate groups
            cursor.execute("""
                SELECT full_name, COUNT(*) as count, 
                       array_agg(id ORDER BY created_at DESC) as ids,
                       array_agg(created_at ORDER BY created_at DESC) as dates
                FROM brokers
                GROUP BY full_name
                HAVING COUNT(*) > 1
                ORDER BY full_name
            """)
            
            duplicate_groups = cursor.fetchall()
            logger.info(f"Found {len(duplicate_groups)} duplicate groups")
            
            if len(duplicate_groups) == 0:
                logger.info("No duplicates found. Database is already clean!")
                return
            
            # Calculate total records to delete
            total_to_delete = sum(count - 1 for _, count, _, _ in duplicate_groups)
            logger.info(f"Total records to delete: {total_to_delete}")
            
            # Show some examples
            logger.info("\nExample duplicate groups (first 3):")
            for i, (name, count, ids, dates) in enumerate(duplicate_groups[:3]):
                logger.info(f"  {i+1}. '{name}' ({count} records)")
                logger.info(f"     KEEP: ID {ids[0]} (created: {dates[0]})")
                for j in range(1, len(ids)):
                    logger.info(f"     DELETE: ID {ids[j]} (created: {dates[j]})")
            
            # Process each duplicate group
            logger.info(f"\nStarting safe cleanup of {total_to_delete} duplicate records...")
            
            updated_references = 0
            deleted_count = 0
            
            for name, count, ids, dates in duplicate_groups:
                keep_id = ids[0]  # Most recent record
                delete_ids = ids[1:]  # Older records
                
                logger.debug(f"Processing group '{name}': keep {keep_id}, delete {delete_ids}")
                
                # For each old ID that will be deleted, update all references to point to the new ID
                for old_id in delete_ids:
                    
                    # Update plots table
                    cursor.execute("""
                        UPDATE plots 
                        SET broker_id = %s 
                        WHERE broker_id = %s
                    """, (keep_id, old_id))
                    
                    plots_updated = cursor.rowcount
                    if plots_updated > 0:
                        logger.debug(f"Updated {plots_updated} plots from broker {old_id} to {keep_id}")
                        updated_references += plots_updated
                    
                    # Update installments table if it exists and has broker_id
                    try:
                        cursor.execute("""
                            UPDATE installments 
                            SET broker_id = %s 
                            WHERE broker_id = %s
                        """, (keep_id, old_id))
                        
                        installments_updated = cursor.rowcount
                        if installments_updated > 0:
                            logger.debug(f"Updated {installments_updated} installments from broker {old_id} to {keep_id}")
                            updated_references += installments_updated
                    except psycopg2.errors.UndefinedColumn:
                        # installments table might not have broker_id column
                        pass
                    except psycopg2.errors.UndefinedTable:
                        # installments table might not exist
                        pass
                    
                    # Update clients table if it has broker_id
                    try:
                        cursor.execute("""
                            UPDATE clients 
                            SET broker_id = %s 
                            WHERE broker_id = %s
                        """, (keep_id, old_id))
                        
                        clients_updated = cursor.rowcount
                        if clients_updated > 0:
                            logger.debug(f"Updated {clients_updated} clients from broker {old_id} to {keep_id}")
                            updated_references += clients_updated
                    except psycopg2.errors.UndefinedColumn:
                        # clients table might not have broker_id column
                        pass
                
                # Now it's safe to delete the old broker records
                for old_id in delete_ids:
                    cursor.execute("DELETE FROM brokers WHERE id = %s", (old_id,))
                    deleted_count += 1
                    logger.debug(f"Deleted broker ID: {old_id}")
            
            # Commit all changes
            conn.commit()
            logger.info(f"Successfully updated {updated_references} foreign key references")
            logger.info(f"Successfully deleted {deleted_count} duplicate records")
            
            # Verify the results
            cursor.execute("SELECT COUNT(*) FROM brokers")
            final_count = cursor.fetchone()[0]
            logger.info(f"Final broker count: {final_count}")
            logger.info(f"Records removed: {initial_count - final_count}")
            
            # Check for remaining duplicates
            cursor.execute("""
                SELECT full_name, COUNT(*) as count
                FROM brokers
                GROUP BY full_name
                HAVING COUNT(*) > 1
            """)
            
            remaining_duplicates = cursor.fetchall()
            if remaining_duplicates:
                logger.warning(f"⚠️  Still have {len(remaining_duplicates)} duplicate groups remaining:")
                for name, count in remaining_duplicates[:5]:
                    logger.warning(f"  '{name}': {count} instances")
            else:
                logger.info("✅ No duplicate full_names remaining!")
            
            # Final verification
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_records,
                    COUNT(DISTINCT full_name) as unique_full_names,
                    COUNT(DISTINCT normalized_name) as unique_normalized_names
                FROM brokers
            """)
            
            counts = cursor.fetchone()
            logger.info(f"\nFinal verification:")
            logger.info(f"  Total brokers: {counts[0]}")
            logger.info(f"  Unique full names: {counts[1]}")
            logger.info(f"  Unique normalized names: {counts[2]}")
            
            success = counts[0] == counts[1] and len(remaining_duplicates) == 0
            
            if success:
                logger.info("🎉 SUCCESS: All broker names are now unique!")
            else:
                logger.warning(f"⚠️  Issues remain: {counts[0]} total vs {counts[1]} unique names")
            
            return {
                'initial_count': initial_count,
                'final_count': final_count,
                'deleted_count': deleted_count,
                'updated_references': updated_references,
                'duplicate_groups_found': len(duplicate_groups),
                'remaining_duplicates': len(remaining_duplicates),
                'unique_full_names': counts[1],
                'unique_normalized_names': counts[2],
                'success': success
            }
            
    except Exception as e:
        logger.error(f"Error during cleanup: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    try:
        logger.info("🧹 SAFE BROKER DATABASE CLEANUP")
        logger.info("=" * 50)
        logger.info("This will update foreign key references and then delete duplicates.")
        
        # Ask for confirmation
        response = input("Continue with safe cleanup? (yes/no): ")
        if response.lower() != 'yes':
            logger.info("Cleanup cancelled by user")
            exit(0)
        
        # Perform cleanup
        results = safe_cleanup_broker_duplicates()
        
        logger.info("\n" + "=" * 50)
        logger.info("SAFE CLEANUP COMPLETED")
        logger.info("=" * 50)
        
        if results['success']:
            logger.info("🎉 Cleanup successful!")
            logger.info(f"✅ Updated {results['updated_references']} foreign key references")
            logger.info(f"✅ Removed {results['deleted_count']} duplicate records")
            logger.info(f"✅ Database now has {results['final_count']} unique brokers")
            logger.info("✅ All brokers with codes remain properly distinguished from plain names")
        else:
            logger.warning("⚠️  Cleanup completed but some issues remain")
        
        logger.info(f"\nFinal statistics: {results}")
        
    except KeyboardInterrupt:
        logger.info("\nCleanup cancelled by user")
    except Exception as e:
        logger.error(f"Cleanup failed: {e}")
        raise
