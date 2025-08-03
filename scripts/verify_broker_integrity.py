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

def verify_broker_integrity():
    """Comprehensive verification of broker database integrity"""
    
    logger.info("Starting comprehensive broker database verification...")
    
    with DatabaseConnector() as conn:
        with conn.cursor() as cursor:
            
            # Get all brokers with detailed info
            cursor.execute("""
                SELECT id, full_name, normalized_name, contact_number, created_at
                FROM brokers
                ORDER BY created_at DESC, id
            """)
            
            brokers = cursor.fetchall()
            logger.info(f"Total brokers in database: {len(brokers)}")
            
            # Convert to DataFrame
            df = pd.DataFrame(brokers, columns=['id', 'full_name', 'normalized_name', 'contact_number', 'created_at'])
            
            # Add analysis columns
            df['has_code'] = df['full_name'].apply(has_alphanumeric_code)
            df['unique_key'] = df.apply(lambda row: f"{row['normalized_name']}|HAS_CODE:{row['has_code']}", axis=1)
            
            # 1. Check for exact duplicates
            logger.info("\n=== EXACT DUPLICATE CHECK ===")
            exact_duplicates = df[df.duplicated(subset=['full_name'], keep=False)]
            if len(exact_duplicates) > 0:
                logger.warning(f"Found {len(exact_duplicates)} exact duplicates by full_name:")
                for name, group in exact_duplicates.groupby('full_name'):
                    logger.warning(f"  '{name}': {len(group)} instances")
                    for _, row in group.iterrows():
                        logger.warning(f"    ID: {row['id']}, Created: {row['created_at']}")
            else:
                logger.info("✅ No exact duplicates found")
            
            # 2. Check for normalized name duplicates
            logger.info("\n=== NORMALIZED NAME DUPLICATE CHECK ===")
            norm_duplicates = df[df.duplicated(subset=['normalized_name'], keep=False)]
            if len(norm_duplicates) > 0:
                logger.info(f"Found {len(norm_duplicates)} records with duplicate normalized names:")
                for name, group in norm_duplicates.groupby('normalized_name'):
                    logger.info(f"  Base name '{name}': {len(group)} variations")
                    for _, row in group.iterrows():
                        code_status = "WITH_CODE" if row['has_code'] else "NO_CODE"
                        logger.info(f"    {code_status}: '{row['full_name']}' (ID: {row['id']})")
            else:
                logger.info("✅ All normalized names are unique")
            
            # 3. Check for unique key duplicates (this should be 0 if our logic is correct)
            logger.info("\n=== UNIQUE KEY DUPLICATE CHECK ===")
            key_duplicates = df[df.duplicated(subset=['unique_key'], keep=False)]
            if len(key_duplicates) > 0:
                logger.error(f"❌ Found {len(key_duplicates)} records with duplicate unique keys:")
                for key, group in key_duplicates.groupby('unique_key'):
                    logger.error(f"  Key '{key}': {len(group)} instances")
                    for _, row in group.iterrows():
                        logger.error(f"    ID: {row['id']}, Name: '{row['full_name']}', Created: {row['created_at']}")
            else:
                logger.info("✅ All unique keys are distinct")
            
            # 4. Verify code detection logic with examples
            logger.info("\n=== CODE DETECTION VERIFICATION ===")
            with_codes = df[df['has_code'] == True]
            without_codes = df[df['has_code'] == False]
            
            logger.info(f"Brokers with codes: {len(with_codes)}")
            logger.info("Examples of brokers WITH codes:")
            for _, row in with_codes.head(5).iterrows():
                logger.info(f"  '{row['full_name']}'")
            
            logger.info(f"\nBrokers without codes: {len(without_codes)}")
            logger.info("Examples of brokers WITHOUT codes:")
            for _, row in without_codes.head(5).iterrows():
                logger.info(f"  '{row['full_name']}'")
            
            # 5. Check for potential issues
            logger.info("\n=== POTENTIAL ISSUES CHECK ===")
            
            # Empty or null names
            empty_names = df[(df['full_name'].isna()) | (df['full_name'].str.strip() == '')]
            if len(empty_names) > 0:
                logger.warning(f"⚠️  Found {len(empty_names)} brokers with empty names")
            else:
                logger.info("✅ No empty names found")
            
            # Very short names (might be incomplete)
            short_names = df[df['full_name'].str.len() < 3]
            if len(short_names) > 0:
                logger.warning(f"⚠️  Found {len(short_names)} brokers with very short names:")
                for _, row in short_names.iterrows():
                    logger.warning(f"    '{row['full_name']}' (ID: {row['id']})")
            else:
                logger.info("✅ No suspiciously short names found")
            
            # 6. Database integrity summary
            logger.info("\n=== DATABASE INTEGRITY SUMMARY ===")
            logger.info(f"Total brokers: {len(df)}")
            logger.info(f"Unique full names: {df['full_name'].nunique()}")
            logger.info(f"Unique normalized names: {df['normalized_name'].nunique()}")
            logger.info(f"Unique keys: {df['unique_key'].nunique()}")
            logger.info(f"Brokers with alphanumeric codes: {len(with_codes)}")
            logger.info(f"Brokers without codes: {len(without_codes)}")
            
            # Check if total unique keys equals total records (perfect scenario)
            if df['unique_key'].nunique() == len(df):
                logger.info("✅ PERFECT: All brokers have unique keys - no duplicates exist!")
            else:
                logger.warning(f"⚠️  Mismatch: {len(df)} total records vs {df['unique_key'].nunique()} unique keys")
            
            # 7. Recent import verification
            logger.info("\n=== RECENT IMPORT VERIFICATION ===")
            today = datetime.now().date()
            recent_imports = df[df['created_at'].dt.date == today]
            
            if len(recent_imports) > 0:
                logger.info(f"Found {len(recent_imports)} brokers imported today:")
                logger.info(f"  With codes: {recent_imports['has_code'].sum()}")
                logger.info(f"  Without codes: {(~recent_imports['has_code']).sum()}")
            else:
                logger.info("No brokers imported today")
            
            return {
                'total_brokers': len(df),
                'unique_full_names': df['full_name'].nunique(),
                'unique_normalized_names': df['normalized_name'].nunique(),
                'unique_keys': df['unique_key'].nunique(),
                'exact_duplicates': len(exact_duplicates),
                'key_duplicates': len(key_duplicates),
                'with_codes': len(with_codes),
                'without_codes': len(without_codes),
                'empty_names': len(empty_names),
                'short_names': len(short_names),
                'recent_imports': len(recent_imports) if 'recent_imports' in locals() else 0,
                'is_clean': df['unique_key'].nunique() == len(df) and len(key_duplicates) == 0
            }

if __name__ == "__main__":
    try:
        stats = verify_broker_integrity()
        
        logger.info(f"\n{'='*50}")
        logger.info("VERIFICATION COMPLETED")
        logger.info(f"{'='*50}")
        
        if stats['is_clean']:
            logger.info("🎉 DATABASE IS CLEAN - No duplicates found!")
            logger.info("✅ All brokers with codes are properly distinguished from plain names")
            logger.info("✅ Database integrity is maintained")
        else:
            logger.warning("⚠️  Database needs cleanup")
            
        logger.info(f"\nFinal Statistics: {stats}")
        
    except Exception as e:
        logger.error(f"Error during verification: {e}")
        raise
