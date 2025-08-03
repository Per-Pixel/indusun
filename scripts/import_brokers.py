#!/usr/bin/env python3

import pandas as pd
import os
import sys
import psycopg2
from dotenv import load_dotenv
import logging
import re
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class DatabaseConnector:
    def __init__(self):
        # Use the same connection parameters as the existing scripts
        self.conn_params = {
            'dbname': 'indusun',
            'user': 'postgres',
            'password': '1234',
            'host': 'localhost',
            'port': 5432
        }
        logger.info(f"Connecting to database: {self.conn_params['dbname']} at {self.conn_params['host']}:{self.conn_params['port']}")

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
    """
    Detect if a broker name contains alphanumeric codes/patterns.
    Returns True if the name contains patterns like:
    - XXX/###/XXX/XX (letters/numbers with slashes)
    - Similar patterns with other separators
    """
    if pd.isna(name) or not name:
        return False
    
    name = str(name).strip()
    
    # Pattern to detect alphanumeric codes
    # Look for patterns with letters, numbers, and separators like /, -, _, etc.
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

def normalize_name_for_comparison(name):
    """
    Normalize name for comparison while preserving the original format.
    This is used to create a comparison key but we keep the original name.
    """
    if pd.isna(name) or not name:
        return None
    
    # Convert to string and strip whitespace
    name = str(name).strip()
    
    # Convert to uppercase for consistency
    name = name.upper()
    
    # Remove extra spaces
    name = re.sub(r'\s+', ' ', name)
    
    return name

def create_unique_broker_key(name):
    """
    Create a unique key for broker identification that considers both
    the base name and whether it has codes.
    """
    normalized = normalize_name_for_comparison(name)
    if not normalized:
        return None
    
    # Create a key that includes whether the name has codes
    has_code = has_alphanumeric_code(name)
    
    # The key includes the normalized name and a flag for code presence
    return f"{normalized}|HAS_CODE:{has_code}"

def load_broker_data():
    """Load and process broker data from Excel file"""
    excel_file = "scripts/data/ALL BROKERS NAME.xlsx"
    
    if not os.path.exists(excel_file):
        logger.error(f"Excel file not found: {excel_file}")
        return None
    
    try:
        logger.info(f"Reading Excel file: {excel_file}")
        df = pd.read_excel(excel_file)
        
        # Get the broker name column (assuming it's the first column)
        broker_col = df.columns[0]
        logger.info(f"Using column '{broker_col}' for broker names")
        
        # Clean and process the data
        brokers = []
        seen_keys = set()
        
        for idx, row in df.iterrows():
            original_name = row[broker_col]
            
            # Skip empty names
            if pd.isna(original_name) or not str(original_name).strip():
                continue
            
            # Clean the name but preserve original format
            cleaned_name = str(original_name).strip()
            
            # Create unique key for this broker
            unique_key = create_unique_broker_key(cleaned_name)
            
            if unique_key and unique_key not in seen_keys:
                seen_keys.add(unique_key)
                
                # Determine if this name has codes
                has_code = has_alphanumeric_code(cleaned_name)
                
                broker_data = {
                    'full_name': cleaned_name,
                    'normalized_name': normalize_name_for_comparison(cleaned_name),
                    'has_code': has_code,
                    'unique_key': unique_key
                }
                
                brokers.append(broker_data)
                
                logger.debug(f"Added broker: {cleaned_name} (has_code: {has_code})")
        
        logger.info(f"Processed {len(brokers)} unique brokers from {len(df)} total entries")
        
        # Show some statistics
        with_codes = sum(1 for b in brokers if b['has_code'])
        without_codes = len(brokers) - with_codes
        
        logger.info(f"Brokers with codes: {with_codes}")
        logger.info(f"Brokers without codes: {without_codes}")
        
        return brokers
        
    except Exception as e:
        logger.error(f"Error reading Excel file: {e}")
        return None

def import_brokers_to_database(brokers):
    """Import broker data to the database"""
    if not brokers:
        logger.error("No broker data to import")
        return False
    
    try:
        with DatabaseConnector() as conn:
            with conn.cursor() as cursor:
                
                # First, check if brokers table exists and get its structure
                cursor.execute("""
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_name = 'brokers'
                    ORDER BY ordinal_position;
                """)
                
                columns = cursor.fetchall()
                if not columns:
                    logger.error("Brokers table does not exist. Please run database setup first.")
                    return False
                
                logger.info("Brokers table structure:")
                for col_name, col_type in columns:
                    logger.info(f"  {col_name}: {col_type}")
                
                # Import brokers
                imported_count = 0
                skipped_count = 0
                
                for broker in brokers:
                    try:
                        # Check if broker already exists (by normalized_name)
                        cursor.execute("""
                            SELECT id FROM brokers 
                            WHERE normalized_name = %s
                        """, (broker['normalized_name'],))
                        
                        existing = cursor.fetchone()
                        
                        if existing:
                            logger.debug(f"Broker already exists: {broker['full_name']}")
                            skipped_count += 1
                            continue
                        
                        # Insert new broker
                        cursor.execute("""
                            INSERT INTO brokers (full_name, normalized_name, created_at)
                            VALUES (%s, %s, %s)
                            RETURNING id
                        """, (
                            broker['full_name'],
                            broker['normalized_name'],
                            datetime.now()
                        ))
                        
                        broker_id = cursor.fetchone()[0]
                        imported_count += 1
                        
                        logger.debug(f"Imported broker ID {broker_id}: {broker['full_name']}")
                        
                    except Exception as e:
                        logger.error(f"Error importing broker {broker['full_name']}: {e}")
                        continue
                
                logger.info(f"Import completed: {imported_count} imported, {skipped_count} skipped")
                return True
                
    except Exception as e:
        logger.error(f"Database error during import: {e}")
        return False

def main():
    """Main function to run the broker import process"""
    logger.info("Starting broker import process...")
    
    # Load broker data from Excel
    brokers = load_broker_data()
    if not brokers:
        logger.error("Failed to load broker data")
        return False
    
    # Import to database
    success = import_brokers_to_database(brokers)
    
    if success:
        logger.info("Broker import completed successfully!")
    else:
        logger.error("Broker import failed!")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
