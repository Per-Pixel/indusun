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

def cleanup_broker_duplicates():
    """Clean up duplicate broker records, keeping the most recent ones"""
    
    logger.info("Starting broker duplicate cleanup...")
    
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
            logger.info("\nExample duplicate groups (first 5):")
            for i, (name, count, ids, dates) in enumerate(duplicate_groups[:5]):
                logger.info(f"  {i+1}. '{name}' ({count} records)")
                logger.info(f"     KEEP: ID {ids[0]} (created: {dates[0]})")
                for j in range(1, len(ids)):
                    logger.info(f"     DELETE: ID {ids[j]} (created: {dates[j]})")
            
            if len(duplicate_groups) > 5:
                logger.info(f"     ... and {len(duplicate_groups) - 5} more groups")
            
            # Perform the cleanup
            logger.info(f"\nStarting deletion of {total_to_delete} duplicate records...")
            
            deleted_count = 0
            for name, count, ids, dates in duplicate_groups:
                # Keep the first (most recent) record, delete the rest
                ids_to_delete = ids[1:]  # Skip the first (most recent) one
                
                for record_id in ids_to_delete:
                    cursor.execute("DELETE FROM brokers WHERE id = %s", (record_id,))
                    deleted_count += 1
                    logger.debug(f"Deleted broker ID: {record_id}")
            
            # Commit the changes
            conn.commit()
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
            
            # Final verification - check unique counts
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
            
            if counts[0] == counts[1]:
                logger.info("🎉 SUCCESS: All broker names are now unique!")
            else:
                logger.warning(f"⚠️  Mismatch: {counts[0]} total vs {counts[1]} unique names")
            
            return {
                'initial_count': initial_count,
                'final_count': final_count,
                'deleted_count': deleted_count,
                'duplicate_groups_found': len(duplicate_groups),
                'remaining_duplicates': len(remaining_duplicates),
                'unique_full_names': counts[1],
                'unique_normalized_names': counts[2],
                'success': counts[0] == counts[1] and len(remaining_duplicates) == 0
            }
            
    except Exception as e:
        logger.error(f"Error during cleanup: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    try:
        logger.info("🧹 BROKER DATABASE CLEANUP")
        logger.info("=" * 50)
        
        # Ask for confirmation
        response = input("This will permanently delete duplicate broker records. Continue? (yes/no): ")
        if response.lower() != 'yes':
            logger.info("Cleanup cancelled by user")
            exit(0)
        
        # Perform cleanup
        results = cleanup_broker_duplicates()
        
        logger.info("\n" + "=" * 50)
        logger.info("CLEANUP COMPLETED")
        logger.info("=" * 50)
        
        if results['success']:
            logger.info("🎉 Cleanup successful!")
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
