import os
import pandas as pd
import psycopg2
from dotenv import load_dotenv
import logging
from datetime import datetime
from psycopg2.extras import RealDictCursor, execute_values

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filename='client_summary.log',
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

def create_summary_table(conn):
    """
    Create a client_summary table in the database if it doesn't exist
    """
    logger.info("Creating client_summary table if it doesn't exist...")
    
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS client_summary (
                id SERIAL PRIMARY KEY,
                client_id INTEGER REFERENCES clients(id),
                client_name TEXT NOT NULL,
                contact_number VARCHAR(50),
                total_installments INTEGER,
                total_amount_paid DECIMAL(12,2),
                plot_numbers TEXT[],
                plot_ids INTEGER[],
                total_plot_amount DECIMAL(12,2),
                remaining_amount DECIMAL(12,2),
                broker_name TEXT,
                last_updated TIMESTAMP DEFAULT NOW()
            )
            """)
            
            # Create index for faster lookups
            cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_client_summary_client_id ON client_summary(client_id);
            CREATE INDEX IF NOT EXISTS idx_client_summary_client_name ON client_summary(client_name);
            """)
            
            conn.commit()
            logger.info("client_summary table created or already exists")
            
    except Exception as e:
        logger.error(f"Error creating client_summary table: {str(e)}")
        conn.rollback()
        raise

def create_detail_table(conn):
    """
    Create a client_installment_detail table in the database if it doesn't exist
    """
    logger.info("Creating client_installment_detail table if it doesn't exist...")
    
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS client_installment_detail (
                id SERIAL PRIMARY KEY,
                client_id INTEGER REFERENCES clients(id),
                client_name TEXT NOT NULL,
                contact_number VARCHAR(50),
                plot_number TEXT,
                plot_size TEXT,
                plot_total_amount DECIMAL(12,2),
                installment_id INTEGER,
                installment_amount DECIMAL(12,2),
                payment_date DATE,
                payment_method VARCHAR(50),
                receipt_number VARCHAR(50),
                remarks TEXT,
                broker_name TEXT,
                last_updated TIMESTAMP DEFAULT NOW()
            )
            """)
            
            # Create index for faster lookups
            cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_client_detail_client_id ON client_installment_detail(client_id);
            CREATE INDEX IF NOT EXISTS idx_client_detail_payment_date ON client_installment_detail(payment_date);
            """)
            
            conn.commit()
            logger.info("client_installment_detail table created or already exists")
            
    except Exception as e:
        logger.error(f"Error creating client_installment_detail table: {str(e)}")
        conn.rollback()
        raise

def generate_client_summary():
    """
    Generate a summary of installments paid by each client.
    This includes:
    - Client name
    - Contact number
    - Total number of installments
    - Total amount paid
    - Plot details
    
    The summary is saved to a CSV file and also imported into the database.
    """
    logger.info("Generating client installment summary...")
    
    try:
        with DatabaseConnector() as conn:
            # Create summary table if it doesn't exist
            create_summary_table(conn)
            
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                # Query to get summary of installments by client
                query = """
                SELECT 
                    c.id AS client_id,
                    c.full_name AS client_name,
                    c.contact_number,
                    COUNT(i.id) AS total_installments,
                    SUM(i.amount) AS total_amount_paid,
                    ARRAY_AGG(DISTINCT p.plot_number) AS plot_numbers,
                    ARRAY_AGG(DISTINCT p.id) AS plot_ids,
                    SUM(p.total_amount) AS total_plot_amount,
                    b.full_name AS broker_name
                FROM 
                    clients c
                JOIN 
                    plots p ON c.id = p.client_id
                LEFT JOIN 
                    installments i ON p.id = i.plot_id
                LEFT JOIN
                    brokers b ON p.broker_id = b.id
                GROUP BY 
                    c.id, c.full_name, c.contact_number, b.full_name
                ORDER BY 
                    c.full_name
                """
                
                cursor.execute(query)
                results = cursor.fetchall()
                
                logger.info(f"Found {len(results)} client summaries")
                
                # Convert to DataFrame for easier manipulation
                df = pd.DataFrame(results)
                
                # Calculate remaining amount
                if not df.empty and 'total_plot_amount' in df.columns and 'total_amount_paid' in df.columns:
                    df['remaining_amount'] = df['total_plot_amount'] - df['total_amount_paid'].fillna(0)
                
                # Save to CSV
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                output_file = f"client_installment_summary_{timestamp}.csv"
                df.to_csv(output_file, index=False)
                
                logger.info(f"Summary saved to {output_file}")
                
                # Import to database
                import_summary_to_db(conn, df)
                
                # Also generate a detailed breakdown for each client
                generate_detailed_breakdown(conn)
                
                return output_file
                
    except Exception as e:
        logger.error(f"Error generating client summary: {str(e)}")
        raise

def import_summary_to_db(conn, df):
    """
    Import the summary DataFrame into the client_summary table
    """
    logger.info("Importing client summary to database...")
    
    try:
        # First, clear the existing data
        with conn.cursor() as cursor:
            cursor.execute("TRUNCATE TABLE client_summary RESTART IDENTITY")
            
            # Prepare data for insertion
            columns = ['client_id', 'client_name', 'contact_number', 'total_installments', 
                      'total_amount_paid', 'plot_numbers', 'plot_ids', 'total_plot_amount', 
                      'remaining_amount', 'broker_name']
            
            # Create a list of tuples from the dataframe
            values = [tuple(x) for x in df[columns].to_numpy()]
            
            # Generate the SQL query
            insert_query = """
            INSERT INTO client_summary (client_id, client_name, contact_number, total_installments, 
                                      total_amount_paid, plot_numbers, plot_ids, total_plot_amount, 
                                      remaining_amount, broker_name)
            VALUES %s
            """
            
            # Execute the batch insert
            execute_values(cursor, insert_query, values)
            
            conn.commit()
            logger.info(f"Successfully imported {len(df)} records to client_summary table")
            
    except Exception as e:
        logger.error(f"Error importing client summary to database: {str(e)}")
        conn.rollback()
        raise
                
    except Exception as e:
        logger.error(f"Error generating client summary: {str(e)}")
        raise

def generate_detailed_breakdown(conn):
    """
    Generate a detailed breakdown of all installments for each client
    """
    logger.info("Generating detailed installment breakdown...")
    
    try:
        # Create detail table if it doesn't exist
        create_detail_table(conn)
        
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Query to get all installments with client details
            query = """
            SELECT 
                c.id AS client_id,
                c.full_name AS client_name,
                c.contact_number,
                p.plot_number,
                p.size AS plot_size,
                p.total_amount AS plot_total_amount,
                i.id AS installment_id,
                i.amount AS installment_amount,
                i.payment_date,
                i.payment_method,
                i.receipt_number,
                i.remarks,
                b.full_name AS broker_name
            FROM 
                clients c
            JOIN 
                plots p ON c.id = p.client_id
            LEFT JOIN 
                installments i ON p.id = i.plot_id
            LEFT JOIN
                brokers b ON p.broker_id = b.id
            ORDER BY 
                c.full_name, p.plot_number, i.payment_date
            """
            
            cursor.execute(query)
            results = cursor.fetchall()
            
            logger.info(f"Found {len(results)} detailed installment records")
            
            # Convert to DataFrame
            df = pd.DataFrame(results)
            
            # Save to CSV
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = f"client_installment_details_{timestamp}.csv"
            df.to_csv(output_file, index=False)
            
            logger.info(f"Detailed breakdown saved to {output_file}")
            
            # Import to database
            import_details_to_db(conn, df)
            
            return output_file
            
    except Exception as e:
        logger.error(f"Error generating detailed breakdown: {str(e)}")
        raise

def import_details_to_db(conn, df):
    """
    Import the detailed breakdown DataFrame into the client_installment_detail table
    """
    logger.info("Importing client installment details to database...")
    
    try:
        # First, clear the existing data
        with conn.cursor() as cursor:
            cursor.execute("TRUNCATE TABLE client_installment_detail RESTART IDENTITY")
            
            # Prepare data for insertion
            columns = ['client_id', 'client_name', 'contact_number', 'plot_number', 
                      'plot_size', 'plot_total_amount', 'installment_id', 'installment_amount', 
                      'payment_date', 'payment_method', 'receipt_number', 'remarks', 'broker_name']
            
            # Filter out rows with missing installment_id (if any)
            if 'installment_id' in df.columns:
                df_filtered = df.dropna(subset=['installment_id'])
            else:
                df_filtered = df
            
            if df_filtered.empty:
                logger.warning("No valid installment records to import")
                return
            
            # Create a list of tuples from the dataframe
            values = [tuple(x) for x in df_filtered[columns].to_numpy()]
            
            # Generate the SQL query
            insert_query = """
            INSERT INTO client_installment_detail (client_id, client_name, contact_number, plot_number, 
                                                plot_size, plot_total_amount, installment_id, installment_amount, 
                                                payment_date, payment_method, receipt_number, remarks, broker_name)
            VALUES %s
            """
            
            # Execute the batch insert
            execute_values(cursor, insert_query, values)
            
            conn.commit()
            logger.info(f"Successfully imported {len(df_filtered)} records to client_installment_detail table")
            
    except Exception as e:
        logger.error(f"Error importing client installment details to database: {str(e)}")
        conn.rollback()
        raise

def main():
    try:
        # Generate summary
        summary_file = generate_client_summary()
        print(f"\nClient installment summary generated successfully!")
        print(f"Summary file: {summary_file}")
        print("\nThis file contains:")
        print("- Client name and contact information")
        print("- Total number of installments paid by each client")
        print("- Total amount paid by each client")
        print("- Plot numbers associated with each client")
        print("- Broker assigned to the client")
        print("- Remaining amount to be paid")
        print("\nThe data has also been imported into the database tables:")
        print("- client_summary: Contains aggregated data for each client")
        print("- client_installment_detail: Contains line-by-line details of each installment")
        print("\nYou can now query these tables directly from your website.")
        
    except Exception as e:
        logger.error(f"Script execution failed: {str(e)}")
        print(f"\nError: {str(e)}")
        print("Please check the log file for more details.")

if __name__ == "__main__":
    main()
