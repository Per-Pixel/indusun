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
    filename='database_migration.log',
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

def check_table_exists(conn, table_name):
    """Check if a table exists in the database"""
    with conn.cursor() as cursor:
        cursor.execute("""
        SELECT EXISTS(
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_name = %s
        )
        """, (table_name,))
        return cursor.fetchone()[0]

def check_column_exists(conn, table_name, column_name):
    """Check if a column exists in a table"""
    with conn.cursor() as cursor:
        cursor.execute("""
        SELECT EXISTS(
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = %s AND column_name = %s
        )
        """, (table_name, column_name))
        return cursor.fetchone()[0]

def alter_tables(conn):
    """Add client_id and broker_id columns to installments table and broker_id to clients table"""
    logger.info("Starting database schema migration...")
    
    with conn.cursor() as cursor:
        # Add client_id to installments table if it doesn't exist
        if not check_column_exists(conn, 'installments', 'client_id'):
            logger.info("Adding client_id column to installments table")
            cursor.execute("""
            ALTER TABLE installments 
            ADD COLUMN client_id INTEGER REFERENCES clients(id)
            """)
            logger.info("client_id column added to installments table")
        else:
            logger.info("client_id column already exists in installments table")
        
        # Add broker_id to installments table if it doesn't exist
        if not check_column_exists(conn, 'installments', 'broker_id'):
            logger.info("Adding broker_id column to installments table")
            cursor.execute("""
            ALTER TABLE installments 
            ADD COLUMN broker_id INTEGER REFERENCES brokers(id)
            """)
            logger.info("broker_id column added to installments table")
        else:
            logger.info("broker_id column already exists in installments table")
        
        # Add broker_id to clients table if it doesn't exist
        if not check_column_exists(conn, 'clients', 'broker_id'):
            logger.info("Adding broker_id column to clients table")
            cursor.execute("""
            ALTER TABLE clients 
            ADD COLUMN broker_id INTEGER REFERENCES brokers(id)
            """)
            logger.info("broker_id column added to clients table")
        else:
            logger.info("broker_id column already exists in clients table")
        
        # Create indexes for faster lookups
        logger.info("Creating indexes for new columns")
        cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_installments_client_id ON installments(client_id);
        CREATE INDEX IF NOT EXISTS idx_installments_broker_id ON installments(broker_id);
        CREATE INDEX IF NOT EXISTS idx_clients_broker_id ON clients(broker_id);
        """)
        
    logger.info("Database schema migration completed successfully")

def populate_installment_relationships(conn):
    """Populate client_id and broker_id in installments table based on plots table"""
    logger.info("Populating client_id and broker_id in installments table...")
    
    with conn.cursor() as cursor:
        # Update client_id in installments based on plot's client
        cursor.execute("""
        UPDATE installments i
        SET client_id = p.client_id
        FROM plots p
        WHERE i.plot_id = p.id AND i.client_id IS NULL
        """)
        
        logger.info(f"Updated client_id for {cursor.rowcount} installment records")
        
        # Update broker_id in installments based on plot's broker
        cursor.execute("""
        UPDATE installments i
        SET broker_id = p.broker_id
        FROM plots p
        WHERE i.plot_id = p.id AND i.broker_id IS NULL
        """)
        
        logger.info(f"Updated broker_id for {cursor.rowcount} installment records")
        
    logger.info("Installment relationships populated successfully")

def populate_client_broker_relationships(conn):
    """Populate broker_id in clients table based on most frequent broker in their installments"""
    logger.info("Populating broker_id in clients table...")
    
    with conn.cursor() as cursor:
        # For each client, find their most common broker based on installments
        cursor.execute("""
        WITH client_brokers AS (
            SELECT 
                i.client_id,
                i.broker_id,
                COUNT(*) as broker_count,
                ROW_NUMBER() OVER (PARTITION BY i.client_id ORDER BY COUNT(*) DESC) as rank
            FROM 
                installments i
            WHERE 
                i.client_id IS NOT NULL AND i.broker_id IS NOT NULL
            GROUP BY 
                i.client_id, i.broker_id
        )
        UPDATE clients c
        SET broker_id = cb.broker_id
        FROM client_brokers cb
        WHERE c.id = cb.client_id AND cb.rank = 1 AND c.broker_id IS NULL
        """)
        
        logger.info(f"Updated broker_id for {cursor.rowcount} client records")
        
    logger.info("Client broker relationships populated successfully")

def replace_gurukrupa_with_indusun(conn):
    """Replace 'gurukrupa' and 'GKC' with 'Indusun' in text fields"""
    logger.info("Replacing 'gurukrupa' and 'GKC' with 'Indusun' in database...")
    
    with conn.cursor() as cursor:
        # Update remarks in installments table
        cursor.execute("""
        UPDATE installments
        SET remarks = REPLACE(REPLACE(REPLACE(remarks, 'gurukrupa', 'Indusun'), 'Gurukrupa', 'Indusun'), 'GURUKRUPA', 'INDUSUN')
        WHERE remarks LIKE '%gurukrupa%' OR remarks LIKE '%Gurukrupa%' OR remarks LIKE '%GURUKRUPA%'
        """)
        
        logger.info(f"Updated 'gurukrupa' to 'Indusun' in {cursor.rowcount} installment remarks")
        
        # Update remarks in installments table for GKC
        cursor.execute("""
        UPDATE installments
        SET remarks = REPLACE(REPLACE(REPLACE(remarks, 'GKC', 'Indusun'), 'Gkc', 'Indusun'), 'gkc', 'Indusun')
        WHERE remarks LIKE '%GKC%' OR remarks LIKE '%Gkc%' OR remarks LIKE '%gkc%'
        """)
        
        logger.info(f"Updated 'GKC' to 'Indusun' in {cursor.rowcount} installment remarks")
        
        # Update receipt_number in installments table
        cursor.execute("""
        UPDATE installments
        SET receipt_number = REPLACE(REPLACE(REPLACE(receipt_number, 'GKC', 'Indusun'), 'Gkc', 'Indusun'), 'gkc', 'Indusun')
        WHERE receipt_number LIKE '%GKC%' OR receipt_number LIKE '%Gkc%' OR receipt_number LIKE '%gkc%'
        """)
        
        logger.info(f"Updated 'GKC' to 'Indusun' in {cursor.rowcount} receipt numbers")
        
    logger.info("Text replacement completed successfully")

def create_installment_summary_view(conn):
    """Create a view for client installment summaries"""
    logger.info("Creating installment_summary_view...")
    
    with conn.cursor() as cursor:
        cursor.execute("""
        CREATE OR REPLACE VIEW installment_summary_view AS
        SELECT 
            c.id AS client_id,
            c.full_name AS client_name,
            c.contact_number,
            COUNT(i.id) AS total_installments,
            SUM(i.amount) AS total_amount_paid,
            ARRAY_AGG(DISTINCT p.plot_number) AS plot_numbers,
            SUM(p.total_amount) AS total_plot_amount,
            SUM(p.total_amount) - SUM(i.amount) AS remaining_amount,
            b.full_name AS broker_name,
            b.id AS broker_id
        FROM 
            clients c
        JOIN 
            installments i ON c.id = i.client_id
        JOIN 
            plots p ON i.plot_id = p.id
        JOIN 
            brokers b ON i.broker_id = b.id
        GROUP BY 
            c.id, c.full_name, c.contact_number, b.full_name, b.id
        ORDER BY 
            c.full_name
        """)
        
    logger.info("installment_summary_view created successfully")

def show_database_stats(conn):
    """Show database statistics after migration"""
    logger.info("Generating database statistics...")
    
    stats = {}
    
    with conn.cursor() as cursor:
        # Count clients
        cursor.execute("SELECT COUNT(*) FROM clients")
        stats['clients'] = cursor.fetchone()[0]
        
        # Count brokers
        cursor.execute("SELECT COUNT(*) FROM brokers")
        stats['brokers'] = cursor.fetchone()[0]
        
        # Count plots
        cursor.execute("SELECT COUNT(*) FROM plots")
        stats['plots'] = cursor.fetchone()[0]
        
        # Count installments
        cursor.execute("SELECT COUNT(*) FROM installments")
        stats['installments'] = cursor.fetchone()[0]
        
        # Count installments with client_id
        cursor.execute("SELECT COUNT(*) FROM installments WHERE client_id IS NOT NULL")
        stats['installments_with_client'] = cursor.fetchone()[0]
        
        # Count installments with broker_id
        cursor.execute("SELECT COUNT(*) FROM installments WHERE broker_id IS NOT NULL")
        stats['installments_with_broker'] = cursor.fetchone()[0]
        
        # Count clients with broker_id
        cursor.execute("SELECT COUNT(*) FROM clients WHERE broker_id IS NOT NULL")
        stats['clients_with_broker'] = cursor.fetchone()[0]
        
    logger.info("Database Statistics:")
    for key, value in stats.items():
        logger.info(f"- {key}: {value}")
        
    return stats

def main():
    try:
        logger.info("Starting database migration process...")
        
        with DatabaseConnector() as conn:
            # Check if tables exist
            tables = ['clients', 'brokers', 'plots', 'installments']
            for table in tables:
                exists = check_table_exists(conn, table)
                logger.info(f"Table '{table}' exists: {exists}")
                if not exists:
                    logger.error(f"Required table '{table}' does not exist. Migration cannot proceed.")
                    return
            
            # Step 1: Alter tables to add new columns
            alter_tables(conn)
            
            # Step 2: Populate client_id and broker_id in installments table
            populate_installment_relationships(conn)
            
            # Step 3: Populate broker_id in clients table
            populate_client_broker_relationships(conn)
            
            # Step 4: Replace 'gurukrupa' and 'GKC' with 'Indusun'
            replace_gurukrupa_with_indusun(conn)
            
            # Step 5: Create a view for easy querying of client installment summaries
            create_installment_summary_view(conn)
            
            # Step 6: Show statistics
            stats = show_database_stats(conn)
            
            print("\nDatabase migration completed successfully!")
            print("\nChanges made:")
            print("1. Added client_id and broker_id columns to the installments table")
            print("2. Added broker_id column to the clients table")
            print("3. Populated these new columns with the correct relationships")
            print("4. Replaced 'gurukrupa' and 'GKC' references with 'Indusun'")
            print("5. Created an installment_summary_view for easy querying")
            print("\nDatabase Statistics:")
            for key, value in stats.items():
                print(f"- {key}: {value}")
            print("\nYou can now query the installment data by client directly from the database.")
            print("Example SQL query:")
            print("""
    SELECT 
        c.full_name AS client_name, 
        c.contact_number,
        COUNT(i.id) AS total_installments,
        SUM(i.amount) AS total_amount_paid
    FROM 
        clients c
    JOIN 
        installments i ON c.id = i.client_id
    GROUP BY 
        c.id, c.full_name, c.contact_number
    ORDER BY 
        c.full_name
            """)
                
    except Exception as e:
        logger.error(f"Migration failed: {str(e)}")
        print(f"\nError: {str(e)}")
        print("Please check the database_migration.log file for more details.")

if __name__ == "__main__":
    main()
