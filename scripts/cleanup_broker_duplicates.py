#!/usr/bin/env python3

import psycopg2
import pandas as pd
import re
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class DatabaseConnector:
    def __init__(self):
        self.conn_params = {
            'dbname': 'indusun',
            'user': 'postgres',
            'password': '1234',
            'host': 'localhost',
            'port': 5432
        }

    def __enter__(self):
        self.conn = psycopg2.connect(**self.conn_params)
        return self.conn

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.conn:
            if exc_type is None: 
                self.conn.commit()
                logger.info("Database changes committed successfully")
            else: 
                self.conn.rollback()
                logger.warning("Database changes rolled back due to error")
            self.conn.close()

def has_alphanumeric_code(name):
    """Detect if a broker name contains alphanumeric codes/patterns."""
    if not name:
        return False
    
    name = str(name).strip()
    
    code_patterns = [
        r'[A-Z]{2,}\s*/\s*\d+',
        r'\d+\s*/\s*[A-Z]{2,}',
        r'[A-Z]+\s*/\s*\d+\s*/\s*[A-Z]+',
        r'[A-Z]+\s*-\s*\d+',
        r'\b[A-Z]{2,}\d+\b',
        r'\b\d+[A-Z]{2,}\b',
    ]
    
    for pattern in code_patterns:
        if re.search(pattern, name):
            return True
    
    return False

def cleanup_broker_duplicates(dry_run=True):
    """
    Clean up duplicate broker records while preserving the most recent ones.
    
    Args:
        dry_run (bool): If True, only analyze and report what would be deleted.
                       If False, actually perform the deletion.
    """
    
    logger.info(f"Starting broker duplicate cleanup (dry_run={dry_run})...")
    
    with DatabaseConnector() as conn:
        with conn.cursor() as cursor:
            
            # Get all brokers
            cursor.execute("""
                SELECT id, full_name, normalized_name, contact_number, created_at
                FROM brokers
                ORDER BY full_name, created_at DESC
            """)
            
            brokers = cursor.fetchall()
            logger.info(f"Total brokers in database: {len(brokers)}")
            
            # Convert to DataFrame
            df = pd.DataFrame(brokers, columns=['id', 'full_name', 'normalized_name', 'contact_number', 'created_at'])
            
            # Add analysis columns
            df['has_code'] = df['full_name'].apply(has_alphanumeric_code)
            df['unique_key'] = df.apply(lambda row: f"{row['normalized_name']}|HAS_CODE:{row['has_code']}", axis=1)
            
            # Find exact duplicates by full_name
            duplicate_groups = df[df.duplicated(subset=['full_name'], keep=False)]
            
            if len(duplicate_groups) == 0:
                logger.info("No exact duplicates found. Database is already clean!")
                return {
                    'total_brokers': len(df),
                    'duplicates_found': 0,
                    'duplicates_removed': 0,
                    'remaining_brokers': len(df)
                }
            
            logger.info(f"Found {len(duplicate_groups)} duplicate records in {duplicate_groups['full_name'].nunique()} groups")
            
            # Identify records to delete (keep the most recent one for each full_name)
            records_to_delete = []
            
            for full_name, group in duplicate_groups.groupby('full_name'):
                if len(group) > 1:
                    # Sort by created_at descending (most recent first)
                    sorted_group = group.sort_values('created_at', ascending=False)
                    
                    # Keep the first (most recent) record, mark others for deletion
                    to_keep = sorted_group.iloc[0]
                    to_delete = sorted_group.iloc[1:]
                    
                    logger.info(f"\nDuplicate group: '{full_name}' ({len(group)} records)")
                    logger.info(f"  KEEPING: ID {to_keep['id']} (created: {to_keep['created_at']})")
                    
                    for _, record in to_delete.iterrows():
                        logger.info(f"  DELETING: ID {record['id']} (created: {record['created_at']})")
                        records_to_delete.append(record['id'])
            
            logger.info(f"\nSummary:")
            logger.info(f"  Total duplicate records found: {len(duplicate_groups)}")
            logger.info(f"  Duplicate groups: {duplicate_groups['full_name'].nunique()}")
            logger.info(f"  Records to delete: {len(records_to_delete)}")
            logger.info(f"  Records to keep: {duplicate_groups['full_name'].nunique()}")
            
            if not dry_run and len(records_to_delete) > 0:
                logger.info(f"\nPerforming actual deletion of {len(records_to_delete)} records...")
                
                # Delete the duplicate records
                for record_id in records_to_delete:
                    cursor.execute("DELETE FROM brokers WHERE id = %s", (record_id,))
                    logger.debug(f"Deleted broker ID: {record_id}")
                
                logger.info(f"Successfully deleted {len(records_to_delete)} duplicate records")
                
                # Verify the cleanup
                cursor.execute("SELECT COUNT(*) FROM brokers")
                final_count = cursor.fetchone()[0]
                logger.info(f"Final broker count: {final_count}")
                
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
                    for name, count in remaining_duplicates:
                        logger.warning(f"  '{name}': {count} instances")
                else:
                    logger.info("✅ No duplicate full_names remaining!")
                
            elif dry_run:
                logger.info(f"\n🔍 DRY RUN - No actual changes made")
                logger.info(f"To perform the actual cleanup, run with dry_run=False")
            
            return {
                'total_brokers': len(df),
                'duplicates_found': len(duplicate_groups),
                'duplicates_removed': len(records_to_delete) if not dry_run else 0,
                'remaining_brokers': len(df) - (len(records_to_delete) if not dry_run else 0),
                'duplicate_groups': duplicate_groups['full_name'].nunique(),
                'dry_run': dry_run
            }

def verify_cleanup():
    """Verify that the cleanup was successful"""
    
    logger.info("Verifying cleanup results...")
    
    with DatabaseConnector() as conn:
        with conn.cursor() as cursor:
            
            # Check total count
            cursor.execute("SELECT COUNT(*) FROM brokers")
            total_count = cursor.fetchone()[0]
            
            # Check for exact duplicates
            cursor.execute("""
                SELECT full_name, COUNT(*) as count
                FROM brokers
                GROUP BY full_name
                HAVING COUNT(*) > 1
            """)
            
            duplicates = cursor.fetchall()
            
            # Check unique keys
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_records,
                    COUNT(DISTINCT full_name) as unique_full_names,
                    COUNT(DISTINCT normalized_name) as unique_normalized_names
                FROM brokers
            """)
            
            counts = cursor.fetchone()
            
            logger.info(f"Verification Results:")
            logger.info(f"  Total brokers: {total_count}")
            logger.info(f"  Unique full names: {counts[1]}")
            logger.info(f"  Unique normalized names: {counts[2]}")
            logger.info(f"  Remaining exact duplicates: {len(duplicates)}")
            
            if len(duplicates) == 0:
                logger.info("✅ Cleanup successful - no exact duplicates remain!")
            else:
                logger.warning(f"⚠️  Still have {len(duplicates)} duplicate groups")
                for name, count in duplicates[:5]:  # Show first 5
                    logger.warning(f"    '{name}': {count} instances")
            
            return {
                'total_brokers': total_count,
                'unique_full_names': counts[1],
                'unique_normalized_names': counts[2],
                'remaining_duplicates': len(duplicates),
                'is_clean': len(duplicates) == 0
            }

if __name__ == "__main__":
    import sys
    
    # Check command line arguments
    dry_run = True
    if len(sys.argv) > 1 and sys.argv[1].lower() in ['false', 'no', 'actual', 'real']:
        dry_run = False
        logger.info("⚠️  ACTUAL CLEANUP MODE - Changes will be permanent!")
        
        # Ask for confirmation
        response = input("Are you sure you want to proceed with actual deletion? (yes/no): ")
        if response.lower() != 'yes':
            logger.info("Cleanup cancelled by user")
            sys.exit(0)
    
    try:
        # Perform cleanup
        stats = cleanup_broker_duplicates(dry_run=dry_run)
        
        if not dry_run:
            # Verify results
            verification = verify_cleanup()
            stats.update(verification)
        
        logger.info(f"\n{'='*50}")
        logger.info("CLEANUP COMPLETED")
        logger.info(f"{'='*50}")
        logger.info(f"Final Statistics: {stats}")
        
    except Exception as e:
        logger.error(f"Error during cleanup: {e}")
        raise
