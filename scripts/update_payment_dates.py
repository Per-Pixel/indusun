import os
import pandas as pd
import psycopg2
from dotenv import load_dotenv
import logging
from datetime import datetime
import re
from psycopg2.extras import execute_values

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filename='update_payment_dates.log',
    filemode='a'
)
logger = logging.getLogger(__name__)

# Add console handler for immediate feedback
console = logging.StreamHandler()
console.setLevel(logging.INFO)
logger.addHandler(console)

# Load environment variables
load_dotenv()

class DatabaseConnector:
    def __init__(self):
        self.conn_params = {
            'dbname': os.getenv('DB_NAME'),
            'user': os.getenv('DB_USER'),
            'password': os.getenv('DB_PASSWORD'),
            'host': os.getenv('DB_HOST'),
            'port': os.getenv('DB_PORT')
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

def clean_date_field(date_val):
    """Convert various date formats to ISO format"""
    if pd.isna(date_val) or date_val == '':
        return None
        
    try:
        # If it's already a datetime
        if isinstance(date_val, datetime):
            return date_val.date().isoformat()
            
        # Try parsing as string
        date_str = str(date_val).strip()
        return pd.to_datetime(date_str).date().isoformat()
    except Exception as e:
        logger.warning(f"Could not parse date: {date_val}, Error: {str(e)}")
        return None

def find_column(df, patterns):
    """Find columns matching any of the patterns"""
    for pattern in patterns:
        matches = [col for col in df.columns if re.search(pattern, col, re.I)]
        if matches:
            return matches[0]
    return None

def clean_column_names(df):
    """Robust column name normalization"""
    df.columns = (
        df.columns
        .str.strip()
        .str.lower()
        .str.replace(r'[^a-z0-9]+', '_', regex=True)
        .str.rstrip('_')
    )
    return df

def load_excel_data(file_path):
    """Load data from CSV file and identify relevant columns"""
    logger.info(f"Loading data from: {file_path}")
    
    # Check if the file exists
    csv_path = file_path.replace('.xlsx', '.csv')
    if not os.path.exists(csv_path):
        logger.info(f"CSV file {csv_path} not found, will use original Excel file")
        csv_path = file_path
    else:
        logger.info(f"Using CSV file: {csv_path}")
    
    try:
        # Read CSV file with python engine for better error reporting
        logger.info("Reading CSV with python engine...")
        df = pd.read_csv(
            csv_path,
            dtype='object',  # Treat all columns as strings initially
            encoding='utf-8',  # Use UTF-8 encoding
            engine='python',  # Use python engine for better error handling
            on_bad_lines='warn'  # Warn about bad lines but don't fail
        )
        
        logger.info(f"Successfully read CSV file")
        logger.info(f"Found {len(df)} rows in CSV file")
        
        # Clean and standardize column names
        df.columns = df.columns.str.strip()
        
        # Identify critical columns
        client_col = find_column(df, ['client name', 'name'])
        plot_no_col = find_column(df, ['plot no', 'plot_number', 'plot'])
        emi_amt_col = find_column(df, ['emi amt', 'emi_amount', 'amount'])
        emi_date_col = find_column(df, ['emi paid date', 'paid_date', 'date'])
        receipt_no_col = find_column(df, ['receipt_no', 'receipt_number', 'receipt'])
        
        if not all([client_col, plot_no_col, emi_amt_col, emi_date_col]):
            missing = []
            if not client_col: missing.append("client name")
            if not plot_no_col: missing.append("plot number")
            if not emi_amt_col: missing.append("EMI amount")
            if not emi_date_col: missing.append("payment date")
            logger.error(f"Missing critical columns in CSV: {', '.join(missing)}")
            raise ValueError(f"Critical columns not found in CSV: {', '.join(missing)}")
        
        logger.info(f"Found critical columns: client='{client_col}', plot='{plot_no_col}', amount='{emi_amt_col}', date='{emi_date_col}', receipt='{receipt_no_col}'")
        
        # Clean data types
        df[client_col] = df[client_col].astype(str).str.strip()
        df[plot_no_col] = df[plot_no_col].astype(str).str.strip()
        df[emi_amt_col] = pd.to_numeric(df[emi_amt_col], errors='coerce')
        
        # Return the cleaned dataframe and column mapping
        return {
            'df': df,
            'columns': {
                'client': client_col,
                'plot_no': plot_no_col,
                'emi_amt': emi_amt_col,
                'emi_date': emi_date_col,
                'receipt_no': receipt_no_col if receipt_no_col else None
            }
        }
    
    except Exception as e:
        logger.error(f"Failed to load data: {str(e)}")
        raise

def update_payment_dates(conn, excel_data):
    """Update payment dates in the installments table using a simpler bulk approach"""
    logger.info("Starting payment date update process...")
    
    # Extract dataframe and column mapping
    df = excel_data['df']
    cols = excel_data['columns']
    
    # Count rows with valid dates
    valid_dates = df[cols['emi_date']].apply(lambda x: clean_date_field(x) is not None)
    valid_date_count = valid_dates.sum()
    logger.info(f"Found {valid_date_count} rows with valid payment dates in data")
    
    # Track statistics
    stats = {
        'total_rows': len(df),
        'valid_dates': valid_date_count,
        'matched_by_receipt': 0,
        'matched_by_plot_amount': 0,
        'matched_by_backup': 0,
        'updated': 0,
        'failed': 0
    }
    
    # Process in batches of 1000 for better memory management
    batch_size = 1000
    valid_df = df[valid_dates]
    batches = [valid_df.iloc[i:i+batch_size] for i in range(0, len(valid_df), batch_size)]
    
    logger.info(f"Processing {len(batches)} batches of data")
    
    with conn.cursor() as cursor:
        # First load all existing data from the database
        cursor.execute("""
        SELECT 
            i.id as installment_id, 
            i.receipt_number, 
            p.plot_number, 
            i.amount, 
            c.full_name
        FROM 
            installments i
        JOIN 
            plots p ON i.plot_id = p.id
        JOIN 
            clients c ON p.client_id = c.id
        """)
        
        db_records = cursor.fetchall()
        
        # Create dictionaries for fast lookups
        db_by_receipt = {}
        db_by_plot_client = {}
        db_by_plot_amount = {}
        
        for row in db_records:
            installment_id, receipt_number, plot_number, amount, client_name = row
            
            # Index by receipt number
            if receipt_number:
                db_by_receipt[receipt_number.lower()] = installment_id
            
            # Index by plot+client
            plot_client_key = (plot_number.lower(), client_name.lower())
            if plot_client_key not in db_by_plot_client:
                db_by_plot_client[plot_client_key] = []
            db_by_plot_client[plot_client_key].append((installment_id, amount))
            
            # Index by plot+amount - convert Decimal to float for consistent key type
            plot_amount_key = (plot_number.lower(), float(amount))
            if plot_amount_key not in db_by_plot_amount:
                db_by_plot_amount[plot_amount_key] = []
            db_by_plot_amount[plot_amount_key].append(installment_id)
        
        logger.info(f"Loaded {len(db_records)} installment records from database for matching")
        
        # Process each batch
        for batch_idx, batch in enumerate(batches):
            logger.info(f"Processing batch {batch_idx+1}/{len(batches)} with {len(batch)} rows")
            
            # Collect updates for this batch
            updates = []
            
            for _, row in batch.iterrows():
                try:
                    client_name = str(row[cols['client']]).strip() if not pd.isna(row[cols['client']]) else None
                    plot_no = str(row[cols['plot_no']]).strip() if not pd.isna(row[cols['plot_no']]) else None
                    amount = float(row[cols['emi_amt']]) if not pd.isna(row[cols['emi_amt']]) else None
                    payment_date = clean_date_field(row[cols['emi_date']])
                    receipt_no = str(row[cols['receipt_no']]).strip() if cols['receipt_no'] and not pd.isna(row[cols['receipt_no']]) else None
                    
                    if not all([client_name, plot_no, amount, payment_date]):
                        logger.warning(f"Incomplete data: client='{client_name}', plot='{plot_no}', amount='{amount}', date='{payment_date}'")
                        stats['failed'] += 1
                        continue
                    
                    installment_id = None
                    
                    # Try matching by receipt number
                    if receipt_no and receipt_no.lower() in db_by_receipt:
                        installment_id = db_by_receipt[receipt_no.lower()]
                        stats['matched_by_receipt'] += 1
                        
                    # Try matching by plot number and client name
                    elif not installment_id:
                        plot_client_key = (plot_no.lower(), client_name.lower())
                        if plot_client_key in db_by_plot_client:
                            for id_amount in db_by_plot_client[plot_client_key]:
                                matched_id, matched_amount = id_amount
                                # Convert Decimal to float before comparison
                                matched_amount_float = float(matched_amount)
                                if abs(matched_amount_float - amount) < 0.01:  # Allow for small rounding differences
                                    installment_id = matched_id
                                    stats['matched_by_plot_amount'] += 1
                                    break
                    
                    # Try matching by plot number and amount only
                    if not installment_id:
                        # Convert amount to float for consistent key type
                        plot_amount_key = (plot_no.lower(), float(amount))
                        if plot_amount_key in db_by_plot_amount and len(db_by_plot_amount[plot_amount_key]) == 1:
                            installment_id = db_by_plot_amount[plot_amount_key][0]
                            stats['matched_by_backup'] += 1
                    
                    # If a match is found, add to updates list
                    if installment_id:
                        updates.append((payment_date, installment_id))
                    else:
                        logger.warning(f"No match found for: client='{client_name}', plot='{plot_no}', amount={amount}, receipt='{receipt_no}'")
                        stats['failed'] += 1
                        
                except Exception as e:
                    logger.error(f"Error processing row: {str(e)}")
                    stats['failed'] += 1
            
            if updates:
                # Use execute_batch for the individual updates
                psycopg2.extras.execute_batch(
                    cursor,
                    "UPDATE installments SET payment_date = %s WHERE id = %s",
                    updates,
                    page_size=100
                )
                
                logger.info(f"Updated {len(updates)} records in batch {batch_idx+1}")
                stats['updated'] += len(updates)
    
    conn.commit()
    
    logger.info("\nUpdate statistics:")
    for key, value in stats.items():
        logger.info(f"{key}: {value}")
    
    return stats

def update_null_payment_dates(conn):
    """Update any NULL payment dates with a default date (installment created_at date)"""
    logger.info("Updating any remaining NULL payment dates...")
    
    with conn.cursor() as cursor:
        cursor.execute("""
        UPDATE installments
        SET payment_date = created_at::date
        WHERE payment_date IS NULL
        """)
        
        logger.info(f"Updated {cursor.rowcount} NULL payment dates to use their created_at date")
        return cursor.rowcount

def main():
    try:
        logger.info("Starting payment date update process...")
        
        # Default Excel path - you can modify this if needed
        excel_path = os.path.join("scripts", "data", "indusun_data.xlsx")
        if not os.path.exists(excel_path):
            logger.warning(f"Excel file not found at {excel_path}")
            excel_path = input("Please enter the path to the Excel file: ")
            if not os.path.exists(excel_path):
                logger.error(f"Excel file not found at {excel_path}")
                print(f"Error: Excel file not found at {excel_path}")
                return
        
        # Load Excel data
        excel_data = load_excel_data(excel_path)
        
        # Connect to database and update payment dates
        with DatabaseConnector() as conn:
            # Update payment dates from Excel
            stats = update_payment_dates(conn, excel_data)
            
            # Update any remaining NULL dates
            null_updated = update_null_payment_dates(conn)
            
            print("\nPayment Date Update Complete!")
            print(f"Excel file processed: {excel_path}")
            print(f"Total rows in Excel: {stats['total_rows']}")
            print(f"Rows with valid dates: {stats['valid_dates']}")
            print(f"Installments updated: {stats['updated']}")
            print(f" - Matched by receipt number: {stats['matched_by_receipt']}")
            print(f" - Matched by plot/client/amount: {stats['matched_by_plot_amount']}")
            print(f" - Matched by plot/amount only: {stats['matched_by_backup']}")
            print(f"Failed matches: {stats['failed']}")
            print(f"NULL dates updated with defaults: {null_updated}")
            print("\nCheck the update_payment_dates.log file for detailed information.")
            
    except Exception as e:
        logger.error(f"Script execution failed: {str(e)}")
        print(f"\nError: {str(e)}")
        print("Please check the log file for more details.")

if __name__ == "__main__":
    main()
