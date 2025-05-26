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
    filename='data_import.log',
    filemode='a'
)
logger = logging.getLogger(__name__)

# Add console handler for immediate feedback
console = logging.StreamHandler()
console.setLevel(logging.INFO)
logger.addHandler(console)

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

def clean_phone_number(phone):
    """Clean and standardize phone numbers"""
    if pd.isna(phone) or phone == '':
        return None
    
    # Convert to string if it's not already
    phone_str = str(phone)
    
    # If multiple phone numbers are provided (separated by /), take the first one
    if '/' in phone_str:
        phone_str = phone_str.split('/')[0].strip()
    
    # Remove any non-digit characters
    digits_only = re.sub(r'\D', '', phone_str)
    
    # Truncate if longer than 15 digits (international standard max length)
    if len(digits_only) > 15:
        logger.warning(f"Truncating long phone number: {phone_str} -> {digits_only[:15]}")
        return digits_only[:15]
    
    return digits_only

def clean_text_field(text, max_length=None):
    """Clean and standardize text fields"""
    if pd.isna(text) or text == '' or text == 'ॐ' or text == 'NA' or text == 'N/A':
        return None
    
    # Convert to string and strip whitespace
    text_str = str(text).strip()
    
    # Truncate if max_length is specified
    if max_length and len(text_str) > max_length:
        logger.warning(f"Truncating text field: '{text_str[:20]}...' to {max_length} chars")
        return text_str[:max_length]
    
    return text_str

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
    except Exception:
        logger.warning(f"Could not parse date: {date_val}")
        return None
        
def clean_amount_field(amount):
    """Convert amount to float"""
    if pd.isna(amount) or amount == '':
        return None
        
    try:
        # Remove any non-numeric characters except decimal point
        amount_str = re.sub(r'[^0-9.]', '', str(amount))
        return float(amount_str)
    except ValueError:
        logger.warning(f"Could not convert amount to float: {amount}")
        return None

def extract_primary_key(value):
    """Extract a consistent primary key from a value"""
    if pd.isna(value) or value == '':
        return None
        
    # Convert to lowercase string and remove special chars
    key = str(value).lower().strip()
    key = re.sub(r'[^a-z0-9]', '', key)
    
    return key if key else None

def normalize_client_name(name):
    """Normalize client name for better duplicate detection"""
    if pd.isna(name) or name == '':
        return None
    
    # Convert to string and strip whitespace
    name_str = str(name).strip()
    
    # Remove extra spaces
    name_str = re.sub(r'\s+', ' ', name_str)
    
    # Convert to title case for consistent capitalization
    name_str = name_str.title()
    
    # Remove special characters that might cause duplicates
    name_str = re.sub(r'[^\w\s]', '', name_str)
    
    return name_str

def find_column(df, patterns):
    """Find columns matching any of the patterns"""
    for pattern in patterns:
        matches = [col for col in df.columns if re.search(pattern, col, re.I)]
        if matches:
            return matches[0]
    return None

def load_and_validate_data(file_path):
    """Load data with column validation"""
    logger.info(f"Loading data from: {file_path}")
    
    try:
        # Read all sheets first to verify contents
        all_sheets = pd.read_excel(file_path, sheet_name=None, dtype='object')
        logger.info(f"Found sheets: {list(all_sheets.keys())}")
        
        # Identify sheets using flexible matching
        main_sheet_key = next((k for k in all_sheets if 'main' in k.lower()), None)
        sheet2_key = next((k for k in all_sheets if 'sheet2' in k.lower()), None)
        agreement_key = next((k for k in all_sheets if 'agree' in k.lower()), None)
        
        if not main_sheet_key:
            raise ValueError("No main sheet found in Excel file")
        
        # Process main sheet (installment records)
        main_df = clean_column_names(all_sheets[main_sheet_key])
        logger.info(f"Main sheet columns: {main_df.columns.tolist()}")
        
        # Identify critical columns in main sheet
        client_col = find_column(main_df, ['client', 'name'])
        contact_col = find_column(main_df, ['contact', 'phone', 'mobile'])
        broker_col = find_column(main_df, ['broker', 'agent'])
        plot_no_col = find_column(main_df, ['plot_no', 'plot_number', 'plot'])
        plot_size_col = find_column(main_df, ['plot_size', 'size'])
        plot_amt_col = find_column(main_df, ['plot_amt', 'total_amount', 'amount'])
        emi_amt_col = find_column(main_df, ['emi_amt', 'installment'])
        emi_date_col = find_column(main_df, ['emi_paid_date', 'paid_date', 'date'])
        
        if not all([client_col, broker_col, plot_no_col]):
            raise ValueError("Critical columns not found in main sheet")
        
        # Process Sheet2 (client list)
        sheet2_df = pd.DataFrame()
        if sheet2_key:
            sheet2_df = clean_column_names(all_sheets[sheet2_key])
            logger.info(f"Sheet2 columns: {sheet2_df.columns.tolist()}")
            
            # Identify critical columns in Sheet2
            sheet2_client_col = find_column(sheet2_df, ['client', 'name'])
            sheet2_contact_col = find_column(sheet2_df, ['contact', 'phone', 'mobile'])
            
            if not all([sheet2_client_col, sheet2_contact_col]):
                logger.warning("Critical columns not found in Sheet2, will use main sheet for client data")
                sheet2_df = pd.DataFrame()
        
        # Process Agreement sheet (broker list)
        agreement_df = pd.DataFrame()
        if agreement_key:
            agreement_df = clean_column_names(all_sheets[agreement_key])
            logger.info(f"Agreement sheet columns: {agreement_df.columns.tolist()}")
            
            # Skip header row if present
            if 'sn' in agreement_df.columns or 'brokar' in agreement_df.columns:
                agreement_df = agreement_df.iloc[1:].reset_index(drop=True)
                
            # Identify critical columns in Agreement sheet
            broker_name_col = find_column(agreement_df, ['name'])
            broker_contact_col = find_column(agreement_df, ['mobile', 'phone', 'contact'])
            
            if not broker_name_col:
                logger.warning("Broker name column not found in Agreement sheet, will use main sheet for broker data")
                agreement_df = pd.DataFrame()
        
        return {
            'main': main_df,
            'sheet2': sheet2_df,
            'agreement': agreement_df,
            'columns': {
                'main': {
                    'client': client_col,
                    'contact': contact_col,
                    'broker': broker_col,
                    'plot_no': plot_no_col,
                    'plot_size': plot_size_col,
                    'plot_amt': plot_amt_col,
                    'emi_amt': emi_amt_col,
                    'emi_date': emi_date_col
                },
                'sheet2': {
                    'client': sheet2_client_col if 'sheet2_client_col' in locals() else None,
                    'contact': sheet2_contact_col if 'sheet2_contact_col' in locals() else None
                },
                'agreement': {
                    'broker': broker_name_col if 'broker_name_col' in locals() else None,
                    'contact': broker_contact_col if 'broker_contact_col' in locals() else None
                }
            }
        }
        
    except Exception as e:
        logger.error(f"Data loading failed: {str(e)}")
        raise

def import_data(conn, data):
    """Handle complete data import with proper handling of installment records"""
    # Use separate transactions for each major import step
    # 1. Import clients
    client_map = import_clients(conn, data)
    
    # 2. Import brokers
    broker_map = import_brokers(conn, data)
    
    # 3. Import plots
    plot_map = import_plots(conn, data, client_map, broker_map)
    
    # 4. Import installments
    import_installments(conn, data, plot_map)
    
    return client_map, broker_map, plot_map

def import_clients(conn, data):
    """Import clients with a separate transaction and better duplicate handling"""
    client_map = {}
    normalized_map = {}  # Map of normalized names to client IDs
    
    with conn.cursor() as cursor:
        # First, drop and recreate all tables with new schemas
        logger.info("Recreating database schema with normalized name indexes...")
        cursor.execute("""
            DROP TABLE IF EXISTS plots, installments, brokers, clients CASCADE;
            
            CREATE TABLE clients (
                id SERIAL PRIMARY KEY,
                full_name TEXT NOT NULL,
                normalized_name TEXT NOT NULL,
                contact_number VARCHAR(50),
                created_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(normalized_name)
            );
            
            CREATE TABLE brokers (
                id SERIAL PRIMARY KEY,
                full_name TEXT NOT NULL,
                normalized_name TEXT NOT NULL,
                contact_number VARCHAR(50),
                created_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(normalized_name)
            );
            
            CREATE TABLE plots (
                id SERIAL PRIMARY KEY,
                plot_number TEXT NOT NULL,
                size TEXT,
                total_amount DECIMAL(12,2),
                client_id INTEGER REFERENCES clients(id),
                broker_id INTEGER REFERENCES brokers(id),
                created_at TIMESTAMP DEFAULT NOW()
            );
            
            CREATE TABLE installments (
                id SERIAL PRIMARY KEY,
                plot_id INTEGER REFERENCES plots(id),
                amount DECIMAL(12,2),
                payment_date DATE,
                payment_method VARCHAR(50),
                receipt_number VARCHAR(50),
                remarks TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            );
        """)
        conn.commit()
        
        # Determine which source to use for client data
        logger.info("Importing clients...")
        
        # Collect client data from both Sheet2 and main sheet
        all_client_data = []
        
        # Add Sheet2 data if available (preferred source)
        if not data['sheet2'].empty and data['columns']['sheet2']['client'] is not None:
            logger.info("Collecting client data from Sheet2")
            sheet2_cols = data['columns']['sheet2']
            sheet2_clients = data['sheet2'][[sheet2_cols['client'], sheet2_cols['contact']]].dropna(subset=[sheet2_cols['client']])
            
            for _, row in sheet2_clients.iterrows():
                client_name = clean_text_field(row[sheet2_cols['client']], 255)
                contact_number = clean_phone_number(row[sheet2_cols['contact']])
                if client_name:
                    all_client_data.append((client_name, contact_number))
        
        # Add main sheet data
        logger.info("Collecting client data from main sheet")
        main_cols = data['columns']['main']
        main_clients = data['main'][[main_cols['client'], main_cols['contact']]].dropna(subset=[main_cols['client']])
        
        for _, row in main_clients.iterrows():
            client_name = clean_text_field(row[main_cols['client']], 255)
            contact_number = clean_phone_number(row[main_cols['contact']])
            if client_name:
                all_client_data.append((client_name, contact_number))
        
        # Process all client data, handling duplicates
        logger.info(f"Processing {len(all_client_data)} total client records")
        
        # Group by normalized name
        normalized_clients = {}
        for client_name, contact_number in all_client_data:
            normalized_name = normalize_client_name(client_name)
            
            if normalized_name in normalized_clients:
                # If we already have this client, keep the contact number if the current one is None
                if normalized_clients[normalized_name][1] is None and contact_number is not None:
                    normalized_clients[normalized_name] = (client_name, contact_number)
            else:
                normalized_clients[normalized_name] = (client_name, contact_number)
        
        # Now insert the unique clients
        total_clients = len(normalized_clients)
        processed = 0
        
        for normalized_name, (client_name, contact_number) in normalized_clients.items():
            try:
                cursor.execute("""
                    INSERT INTO clients (full_name, normalized_name, contact_number)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (normalized_name) DO UPDATE SET
                    contact_number = COALESCE(EXCLUDED.contact_number, clients.contact_number)
                    RETURNING id, full_name, normalized_name
                """, (client_name, normalized_name, contact_number))
                client_id, name, norm_name = cursor.fetchone()
                
                # Store mappings for both original and normalized names
                client_map[name] = client_id
                normalized_map[norm_name] = client_id
                
                # Also store a primary key version for fuzzy matching
                client_map[extract_primary_key(name)] = client_id
            except Exception as e:
                logger.error(f"Error inserting client {client_name}: {str(e)}")
                conn.rollback()  # Rollback the current transaction
                conn.commit()    # Start a new transaction
                
            # Progress tracking
            processed += 1
            if processed % 100 == 0:
                logger.info(f"Processed {processed}/{total_clients} unique clients")
                conn.commit()  # Commit every 100 records to avoid long transactions
                
        # Final commit for this section
        conn.commit()
        logger.info(f"Imported {len(normalized_map)} unique clients")
        
        # Return both maps for use in later functions
        return client_map, normalized_map

def import_brokers(conn, data):
    """Import brokers with a separate transaction and better duplicate handling"""
    broker_map = {}
    normalized_broker_map = {}
    
    with conn.cursor() as cursor:
        
        # Collect broker data from both Agreement sheet and main sheet
        logger.info("Importing brokers...")
        all_broker_data = []
        
        # Add Agreement sheet data if available (preferred source)
        if not data['agreement'].empty and data['columns']['agreement']['broker'] is not None:
            logger.info("Collecting broker data from Agreement sheet")
            broker_cols = data['columns']['agreement']
            
            # Extract brokers from Agreement sheet
            agreement_brokers = data['agreement'][[broker_cols['broker']]]
            if broker_cols['contact'] is not None:
                agreement_brokers = data['agreement'][[broker_cols['broker'], broker_cols['contact']]]
            
            agreement_brokers = agreement_brokers.dropna(subset=[broker_cols['broker']])
            
            for _, row in agreement_brokers.iterrows():
                broker_name = clean_text_field(row[broker_cols['broker']], 255)
                contact_number = None
                if broker_cols['contact'] is not None:
                    contact_number = clean_phone_number(row[broker_cols['contact']])
                
                if broker_name:
                    all_broker_data.append((broker_name, contact_number))
        
        # Add main sheet broker data
        logger.info("Collecting broker data from main sheet")
        main_cols = data['columns']['main']
        main_brokers = data['main'][[main_cols['broker']]].dropna()
        
        for _, row in main_brokers.iterrows():
            broker_name = clean_text_field(row[main_cols['broker']], 255)
            if broker_name:
                all_broker_data.append((broker_name, None))
        
        # Process all broker data, handling duplicates
        logger.info(f"Processing {len(all_broker_data)} total broker records")
        
        # Group by normalized name
        normalized_brokers = {}
        for broker_name, contact_number in all_broker_data:
            normalized_name = normalize_client_name(broker_name)  # Reuse the same normalization function
            
            if normalized_name in normalized_brokers:
                # If we already have this broker, keep the contact number if the current one is None
                if normalized_brokers[normalized_name][1] is None and contact_number is not None:
                    normalized_brokers[normalized_name] = (broker_name, contact_number)
            else:
                normalized_brokers[normalized_name] = (broker_name, contact_number)
        
        # Now insert the unique brokers
        total_brokers = len(normalized_brokers)
        processed = 0
        
        for normalized_name, (broker_name, contact_number) in normalized_brokers.items():
            try:
                cursor.execute("""
                    INSERT INTO brokers (full_name, normalized_name, contact_number)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (normalized_name) DO UPDATE SET
                    contact_number = COALESCE(EXCLUDED.contact_number, brokers.contact_number)
                    RETURNING id, full_name, normalized_name
                """, (broker_name, normalized_name, contact_number))
                broker_id, name, norm_name = cursor.fetchone()
                
                # Store mappings for both original and normalized names
                broker_map[name] = broker_id
                normalized_broker_map[norm_name] = broker_id
                
                # Also store a primary key version for fuzzy matching
                broker_map[extract_primary_key(name)] = broker_id
            except Exception as e:
                logger.error(f"Error inserting broker {broker_name}: {str(e)}")
                conn.rollback()  # Rollback the current transaction
                conn.commit()    # Start a new transaction
                
            # Progress tracking
            processed += 1
            if processed % 10 == 0:
                logger.info(f"Processed {processed}/{total_brokers} unique brokers")
                conn.commit()  # Commit every 10 records to avoid long transactions
                    
        # Final commit for this section
        conn.commit()
        logger.info(f"Imported {len(normalized_broker_map)} unique brokers")
        
        # Return both maps for use in later functions
        return broker_map, normalized_broker_map

def import_plots(conn, data, client_maps, broker_maps):
    """Import plots with a separate transaction"""
    plot_map = {}
    
    # Unpack the maps
    client_map, normalized_client_map = client_maps
    broker_map, normalized_broker_map = broker_maps
    
    with conn.cursor() as cursor:
        
        # Extract plot data from main sheet
        logger.info("Importing plots...")
        main_cols = data['columns']['main']
        plot_no_col = main_cols['plot_no']
        plot_size_col = main_cols['plot_size']
        plot_amt_col = main_cols['plot_amt']
        client_col = main_cols['client']
        broker_col = main_cols['broker']
        
        # Create a unique identifier for each plot (plot_number + client)
        data['main']['plot_key'] = data['main'].apply(
            lambda row: f"{clean_text_field(row[plot_no_col])}__{clean_text_field(row[client_col])}", 
            axis=1
        )
        
        # Get unique plots
        unique_plots = data['main'][[plot_no_col, plot_size_col, plot_amt_col, client_col, broker_col, 'plot_key']]
        unique_plots = unique_plots.drop_duplicates(subset=['plot_key']).dropna(subset=[plot_no_col, client_col])
        
        # Track progress
        total_plots = len(unique_plots)
        processed = 0
        successful = 0
        
        for _, row in unique_plots.iterrows():
            # Clean the data
            plot_number = clean_text_field(row[plot_no_col], 100)
            plot_size = clean_text_field(row.get(plot_size_col), 50) if plot_size_col else None
            
            # Handle amount field - convert to decimal or None
            plot_amount = None
            if plot_amt_col and not pd.isna(row.get(plot_amt_col)):
                try:
                    plot_amount = clean_amount_field(row.get(plot_amt_col))
                except (ValueError, TypeError):
                    pass
                
            # Get client and broker IDs
            client_name = clean_text_field(row[client_col])
            broker_name = clean_text_field(row[broker_col]) if not pd.isna(row.get(broker_col)) else None
            
            # Normalize names for better matching
            normalized_client_name = normalize_client_name(client_name)
            normalized_broker_name = normalize_client_name(broker_name) if broker_name else None
            
            # Try to find client ID using multiple methods
            client_id = None
            
            # 1. Try exact match on normalized name (most reliable)
            if normalized_client_name in normalized_client_map:
                client_id = normalized_client_map[normalized_client_name]
            # 2. Try exact match on original name
            elif client_name in client_map:
                client_id = client_map[client_name]
            # 3. Try fuzzy match using primary key
            elif extract_primary_key(client_name) in client_map:
                client_id = client_map[extract_primary_key(client_name)]
                
            # Try to find broker ID using multiple methods
            broker_id = None
            if broker_name:
                # 1. Try exact match on normalized name (most reliable)
                if normalized_broker_name in normalized_broker_map:
                    broker_id = normalized_broker_map[normalized_broker_name]
                # 2. Try exact match on original name
                elif broker_name in broker_map:
                    broker_id = broker_map[broker_name]
                # 3. Try fuzzy match using primary key
                elif extract_primary_key(broker_name) in broker_map:
                    broker_id = broker_map[extract_primary_key(broker_name)]
            
            if not plot_number or not client_id:  # Skip plots without numbers or client
                continue
                
            try:
                cursor.execute("""
                    INSERT INTO plots (plot_number, size, total_amount, client_id, broker_id)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT DO NOTHING
                    RETURNING id, plot_number
                """, (
                    plot_number,
                    plot_size,
                    plot_amount,
                    client_id,
                    broker_id
                ))
                plot_id, plot_num = cursor.fetchone()
                plot_map[row['plot_key']] = plot_id
                successful += 1
            except Exception as e:
                logger.error(f"Error inserting plot {plot_number}: {str(e)}")
                conn.rollback()  # Rollback the current transaction
                conn.commit()    # Start a new transaction
                
            # Progress tracking
            processed += 1
            if processed % 50 == 0:
                logger.info(f"Processed {processed}/{total_plots} plots")
                conn.commit()  # Commit every 50 records to avoid long transactions
                
        # Final commit for this section
        conn.commit()
        logger.info(f"Imported {successful} unique plots")
        
        return plot_map

def import_installments(conn, data, plot_map):
    """Import installments with a separate transaction"""
    with conn.cursor() as cursor:
        
        # Extract installment data from main sheet
        logger.info("Importing installments...")
        main_cols = data['columns']['main']
        plot_no_col = main_cols['plot_no']
        client_col = main_cols['client']
        emi_amt_col = main_cols['emi_amt']
        emi_date_col = main_cols['emi_date']
        
        # Filter rows with installment amount
        installment_data = data['main'][
            [plot_no_col, client_col, 'plot_key', emi_amt_col, emi_date_col]
        ].dropna(subset=[emi_amt_col])
        
        # Get payment method and receipt number if available
        payment_method_col = find_column(data['main'], ['cheque_cash', 'payment_method', 'method'])
        receipt_no_col = find_column(data['main'], ['r_no', 'receipt', 'receipt_no'])
        remarks_col = find_column(data['main'], ['remarks', 'note', 'comment'])
        
        if payment_method_col:
            installment_data[payment_method_col] = data['main'][payment_method_col]
            
        if receipt_no_col:
            installment_data[receipt_no_col] = data['main'][receipt_no_col]
            
        if remarks_col:
            installment_data[remarks_col] = data['main'][remarks_col]
        
        # Track progress
        total_installments = len(installment_data)
        processed = 0
        successful = 0
        
        # Process in smaller batches for better transaction management
        batch_size = 500
        for batch_start in range(0, len(installment_data), batch_size):
            batch_end = min(batch_start + batch_size, len(installment_data))
            batch = installment_data.iloc[batch_start:batch_end]
            
            # Batch insert installments for better performance
            installment_values = []
            
            for _, row in batch.iterrows():
                plot_key = row['plot_key']
                plot_id = plot_map.get(plot_key)
                
                if not plot_id:  # Skip installments without plot
                    continue
                    
                # Clean the data
                amount = clean_amount_field(row[emi_amt_col])
                payment_date = clean_date_field(row.get(emi_date_col))
                
                payment_method = None
                if payment_method_col and not pd.isna(row.get(payment_method_col)):
                    payment_method = clean_text_field(row[payment_method_col], 50)
                    
                receipt_number = None
                if receipt_no_col and not pd.isna(row.get(receipt_no_col)):
                    receipt_number = clean_text_field(row[receipt_no_col], 50)
                    
                remarks = None
                if remarks_col and not pd.isna(row.get(remarks_col)):
                    remarks = clean_text_field(row[remarks_col], 255)
                
                if not amount:  # Skip installments without amount
                    continue
                    
                # Add to batch
                installment_values.append((plot_id, amount, payment_date, payment_method, receipt_number, remarks))
            
            # Insert the batch - but first make sure we have valid plot IDs
            valid_installment_values = []
            for inst_value in installment_values:
                plot_id = inst_value[0]
                # Verify the plot_id exists in the database
                try:
                    cursor.execute("SELECT 1 FROM plots WHERE id = %s", (plot_id,))
                    if cursor.fetchone():
                        valid_installment_values.append(inst_value)
                except Exception as e:
                    logger.error(f"Error checking plot ID {plot_id}: {str(e)}")
            
            if valid_installment_values:
                try:
                    execute_values(cursor, """
                        INSERT INTO installments (plot_id, amount, payment_date, payment_method, receipt_number, remarks)
                        VALUES %s
                    """, valid_installment_values)
                    successful += len(valid_installment_values)
                except Exception as e:
                    logger.error(f"Error inserting installment batch: {str(e)}")
                    conn.rollback()  # Rollback the current transaction
                    
                # Commit after each batch
                conn.commit()
            
            # Progress tracking
            processed += len(batch)
            logger.info(f"Processed {processed}/{total_installments} installments")
        
        logger.info(f"Imported {successful} installments out of {total_installments} processed")
        
        return successful

def setup_database(conn):
    """Set up or update database schema if needed"""
    with conn.cursor() as cursor:
        # Check if tables exist
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'clients'
            )
        """)
        clients_exists = cursor.fetchone()[0]
        
        if not clients_exists:
            logger.info("Creating database schema...")
            cursor.execute("""
                -- Drop tables if they exist (for clean start)
                DROP TABLE IF EXISTS installments, plots, brokers, clients CASCADE;
                
                -- Create clients table
                CREATE TABLE clients (
                    id SERIAL PRIMARY KEY,
                    full_name TEXT NOT NULL UNIQUE,
                    contact_number VARCHAR(50),
                    created_at TIMESTAMP DEFAULT NOW()
                );
                
                -- Create brokers table
                CREATE TABLE brokers (
                    id SERIAL PRIMARY KEY,
                    full_name TEXT NOT NULL UNIQUE,
                    contact_number VARCHAR(50),
                    created_at TIMESTAMP DEFAULT NOW()
                );
                
                -- Create plots table
                CREATE TABLE plots (
                    id SERIAL PRIMARY KEY,
                    plot_number TEXT NOT NULL,
                    size TEXT,
                    total_amount DECIMAL(12,2),
                    client_id INTEGER REFERENCES clients(id),
                    broker_id INTEGER REFERENCES brokers(id),
                    created_at TIMESTAMP DEFAULT NOW()
                );
                
                -- Create installments table
                CREATE TABLE installments (
                    id SERIAL PRIMARY KEY,
                    plot_id INTEGER REFERENCES plots(id),
                    amount DECIMAL(12,2),
                    payment_date DATE,
                    payment_method VARCHAR(50),
                    receipt_number VARCHAR(50),
                    remarks TEXT,
                    created_at TIMESTAMP DEFAULT NOW()
                );
            """)
            logger.info("Database schema created successfully")
        else:
            # Check if installments table exists with all required columns
            cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'installments'
                )
            """)
            installments_exists = cursor.fetchone()[0]
            
            if installments_exists:
                # Check if payment_date column exists
                cursor.execute("""
                    SELECT EXISTS (
                        SELECT FROM information_schema.columns
                        WHERE table_name = 'installments' AND column_name = 'payment_date'
                    )
                """)
                payment_date_exists = cursor.fetchone()[0]
                
                if not payment_date_exists:
                    logger.info("Dropping and recreating installments table with correct schema...")
                    cursor.execute("DROP TABLE installments CASCADE;")
                    installments_exists = False
            
            if not installments_exists:
                logger.info("Creating installments table...")
                cursor.execute("""
                    CREATE TABLE installments (
                        id SERIAL PRIMARY KEY,
                        plot_id INTEGER REFERENCES plots(id),
                        amount DECIMAL(12,2),
                        payment_date DATE,
                        payment_method VARCHAR(50),
                        receipt_number VARCHAR(50),
                        remarks TEXT,
                        created_at TIMESTAMP DEFAULT NOW()
                    );
                """)
            
            # Check if broker table has contact_number column
            cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.columns 
                    WHERE table_name = 'brokers' AND column_name = 'contact_number'
                )
            """)
            broker_contact_exists = cursor.fetchone()[0]
            
            if not broker_contact_exists:
                logger.info("Adding contact_number column to brokers table...")
                cursor.execute("""
                    ALTER TABLE brokers 
                    ADD COLUMN contact_number VARCHAR(50)
                """)
            
            # Check if we need to alter the contact_number column
            cursor.execute("""
                SELECT character_maximum_length 
                FROM information_schema.columns 
                WHERE table_name = 'clients' AND column_name = 'contact_number'
            """)
            result = cursor.fetchone()
            if result and result[0] < 50:
                logger.info("Altering contact_number column to allow longer values")
                cursor.execute("""
                    ALTER TABLE clients 
                    ALTER COLUMN contact_number TYPE VARCHAR(50)
                """)
                
        conn.commit()

def main():
    file_path = os.path.join(os.path.dirname(__file__), 'data', 'indusun_data.xlsx')
    
    try:
        # Load and validate the data
        data = load_and_validate_data(file_path)
        
        # Import the data in separate transactions
        # 1. Import clients with normalized names to avoid duplicates
        with DatabaseConnector() as conn:
            client_maps = import_clients(conn, data)
        
        # 2. Import brokers with normalized names
        with DatabaseConnector() as conn:
            broker_maps = import_brokers(conn, data)
        
        # 3. Import plots using normalized client and broker data
        with DatabaseConnector() as conn:
            plot_map = import_plots(conn, data, client_maps, broker_maps)
        
        # 4. Import installments
        with DatabaseConnector() as conn:
            installment_count = import_installments(conn, data, plot_map)
        
        # Print summary statistics
        with DatabaseConnector() as conn:
            with conn.cursor() as cursor:
                try:
                    cursor.execute("SELECT COUNT(*) FROM clients")
                    client_count = cursor.fetchone()[0]
                    
                    cursor.execute("SELECT COUNT(*) FROM brokers")
                    broker_count = cursor.fetchone()[0]
                    
                    cursor.execute("SELECT COUNT(*) FROM plots")
                    plot_count = cursor.fetchone()[0]
                    
                    cursor.execute("SELECT COUNT(*) FROM installments")
                    installment_count = cursor.fetchone()[0]
                    
                    logger.info("\n" + "=" * 50)
                    logger.info("IMPORT SUMMARY")
                    logger.info("=" * 50)
                    logger.info(f"Unique Clients: {client_count}")
                    logger.info(f"Unique Brokers: {broker_count}")
                    logger.info(f"Unique Plots: {plot_count}")
                    logger.info(f"Total Installments: {installment_count}")
                    logger.info("=" * 50)
                except Exception as e:
                    logger.error(f"Error getting statistics: {str(e)}")
                
        logger.info("Data import completed successfully!")
            
    except Exception as e:
        logger.error(f"Fatal error: {str(e)}", exc_info=True)
        raise

if __name__ == '__main__':
    main()