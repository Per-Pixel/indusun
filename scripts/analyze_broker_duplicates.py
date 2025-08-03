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
            else: 
                self.conn.rollback()
            self.conn.close()

def has_alphanumeric_code(name):
    """
    Detect if a broker name contains alphanumeric codes/patterns.
    Same logic as used in the import script.
    """
    if not name:
        return False
    
    name = str(name).strip()
    
    # Pattern to detect alphanumeric codes
    code_patterns = [
        r'[A-Z]{2,}\s*/\s*\d+',  # Letters followed by slash and numbers (e.g., "GKC/015")
        r'\d+\s*/\s*[A-Z]{2,}',  # Numbers followed by slash and letters
        r'[A-Z]+\s*/\s*\d+\s*/\s*[A-Z]+',  # Pattern like "GKC/015/DSA"
        r'[A-Z]+\s*-\s*\d+',     # Letters followed by dash and numbers
        r'\b[A-Z]{2,}\d+\b',     # Letters directly followed by numbers (e.g., "ABC123")
        r'\b\d+[A-Z]{2,}\b',     # Numbers directly followed by letters
    ]
    
    for pattern in code_patterns:
        if re.search(pattern, name):
            return True
    
    return False

def analyze_broker_duplicates():
    """Analyze the broker database for duplicates"""
    
    logger.info("Starting broker duplicate analysis...")
    
    with DatabaseConnector() as conn:
        with conn.cursor() as cursor:
            
            # Get all brokers
            cursor.execute("""
                SELECT id, full_name, normalized_name, created_at
                FROM brokers
                ORDER BY normalized_name, created_at
            """)
            
            brokers = cursor.fetchall()
            logger.info(f"Total brokers in database: {len(brokers)}")
            
            # Convert to DataFrame for easier analysis
            df = pd.DataFrame(brokers, columns=['id', 'full_name', 'normalized_name', 'created_at'])
            
            # Add has_code column
            df['has_code'] = df['full_name'].apply(has_alphanumeric_code)
            
            # Create unique key (same logic as import script)
            df['unique_key'] = df.apply(lambda row: f"{row['normalized_name']}|HAS_CODE:{row['has_code']}", axis=1)
            
            # Analyze duplicates
            logger.info("\n=== DUPLICATE ANALYSIS ===")
            
            # 1. True duplicates (same unique_key)
            duplicate_groups = df.groupby('unique_key').filter(lambda x: len(x) > 1)
            
            if len(duplicate_groups) > 0:
                logger.info(f"Found {len(duplicate_groups)} duplicate records in {duplicate_groups['unique_key'].nunique()} groups")
                
                # Show some examples
                logger.info("\nExample duplicate groups:")
                for unique_key, group in duplicate_groups.groupby('unique_key'):
                    if len(group) > 1:
                        logger.info(f"\nGroup: {unique_key}")
                        for _, row in group.iterrows():
                            logger.info(f"  ID: {row['id']}, Name: {row['full_name']}, Created: {row['created_at']}")
                        
                        # Show only first 5 groups to avoid spam
                        if duplicate_groups['unique_key'].nunique() > 5:
                            shown_groups = len([g for g in duplicate_groups.groupby('unique_key')])
                            if shown_groups >= 5:
                                logger.info(f"\n... and {duplicate_groups['unique_key'].nunique() - 5} more groups")
                                break
            else:
                logger.info("No true duplicates found!")
            
            # 2. Potential confusion cases (same base name but different code status)
            logger.info("\n=== POTENTIAL CONFUSION CASES ===")
            base_names = df['normalized_name'].value_counts()
            confusion_cases = base_names[base_names > 1]
            
            if len(confusion_cases) > 0:
                logger.info(f"Found {len(confusion_cases)} base names with multiple variations:")
                
                for base_name in confusion_cases.index[:10]:  # Show first 10
                    variants = df[df['normalized_name'] == base_name]
                    logger.info(f"\nBase name: {base_name}")
                    for _, row in variants.iterrows():
                        code_status = "WITH_CODE" if row['has_code'] else "NO_CODE"
                        logger.info(f"  {code_status}: {row['full_name']} (ID: {row['id']})")
                
                if len(confusion_cases) > 10:
                    logger.info(f"\n... and {len(confusion_cases) - 10} more base names with variations")
            else:
                logger.info("No confusion cases found!")
            
            # 3. Summary statistics
            logger.info("\n=== SUMMARY STATISTICS ===")
            logger.info(f"Total brokers: {len(df)}")
            logger.info(f"Unique base names: {df['normalized_name'].nunique()}")
            logger.info(f"Unique keys (should equal total if no duplicates): {df['unique_key'].nunique()}")
            logger.info(f"Brokers with codes: {df['has_code'].sum()}")
            logger.info(f"Brokers without codes: {(~df['has_code']).sum()}")
            logger.info(f"True duplicates to remove: {len(duplicate_groups)}")
            
            return {
                'total_brokers': len(df),
                'unique_keys': df['unique_key'].nunique(),
                'duplicates_to_remove': len(duplicate_groups),
                'duplicate_groups': duplicate_groups['unique_key'].nunique() if len(duplicate_groups) > 0 else 0,
                'confusion_cases': len(confusion_cases),
                'with_codes': df['has_code'].sum(),
                'without_codes': (~df['has_code']).sum()
            }

if __name__ == "__main__":
    try:
        stats = analyze_broker_duplicates()
        logger.info(f"\nAnalysis completed successfully!")
        logger.info(f"Statistics: {stats}")
    except Exception as e:
        logger.error(f"Error during analysis: {e}")
        raise
