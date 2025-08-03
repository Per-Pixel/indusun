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

def normalize_name(name):
    """Normalize broker name for consistent storage and comparison"""
    if pd.isna(name) or not name:
        return None

    # Convert to string and strip whitespace
    name = str(name).strip()

    # Convert to uppercase for consistency
    name = name.upper()

    # Remove extra spaces
    name = re.sub(r'\s+', ' ', name)

    return name

def analyze_excel_file():
    """Analyze the broker Excel file structure"""

    # Check if file exists
    excel_file = "scripts/data/ALL BROKERS NAME.xlsx"
    if not os.path.exists(excel_file):
        print(f"Error: File {excel_file} not found")
        print("Available files in scripts/data:")
        for f in os.listdir("scripts/data"):
            print(f"  {f}")
        return

    try:
        # Read the Excel file
        print(f"Reading Excel file: {excel_file}")
        df = pd.read_excel(excel_file)

        print("\n=== EXCEL FILE ANALYSIS ===")
        print(f"File: {excel_file}")
        print(f"Shape: {df.shape} (rows x columns)")
        print(f"Columns: {list(df.columns)}")

        print("\n=== COLUMN DATA TYPES ===")
        for col in df.columns:
            print(f"{col}: {df[col].dtype}")

        print("\n=== FIRST 5 ROWS ===")
        print(df.head())

        print("\n=== SAMPLE DATA (First 3 rows as dict) ===")
        for i, row in df.head(3).iterrows():
            print(f"Row {i+1}: {dict(row)}")

        print("\n=== DATA SUMMARY ===")
        print(f"Total records: {len(df)}")
        print(f"Non-null counts per column:")
        for col in df.columns:
            non_null = df[col].notna().sum()
            print(f"  {col}: {non_null}/{len(df)} ({non_null/len(df)*100:.1f}%)")

        # Check for duplicates
        if len(df.columns) > 0:
            first_col = df.columns[0]
            duplicates = df[first_col].duplicated().sum()
            print(f"\nDuplicates in '{first_col}': {duplicates}")

        return df

    except Exception as e:
        print(f"Error reading Excel file: {e}")
        return None
