import pandas as pd
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filename='debug_excel.log',
    filemode='w'
)
logger = logging.getLogger(__name__)

# Add console handler for immediate feedback
console = logging.StreamHandler()
console.setLevel(logging.INFO)
logger.addHandler(console)

def debug_excel_file():
    """Debug script to understand Excel file structure and content"""
    try:
        # Get the Excel file path
        excel_path = os.path.join("scripts", "data", "indusun_data.xlsx")
        logger.info(f"Attempting to read Excel file from: {excel_path}")
        
        # Check if file exists
        if not os.path.exists(excel_path):
            logger.error(f"Excel file not found at: {excel_path}")
            return
            
        # Read the MAIN SHEET with header=1
        logger.info("\nReading MAIN SHEET with header=1...")
        df = pd.read_excel(excel_path, sheet_name='MAIN SHEET', header=1)
        
        # Log basic info
        logger.info(f"Successfully read MAIN SHEET")
        logger.info(f"Rows: {len(df)}, Columns: {len(df.columns)}")
        
        # Log column information
        logger.info("\nColumn names:")
        for col in df.columns:
            logger.info(f"- {col}")
        
        # Log first few rows
        logger.info("\nFirst 5 rows:")
        for _, row in df.head(5).iterrows():
            logger.info("- " + str(dict(row)))
            
        # Check for EMI PAID DATE column
        emi_date_col = None
        for col in df.columns:
            if 'emi paid date' in str(col).lower():
                emi_date_col = col
                break
        
        if emi_date_col:
            logger.info(f"\nFound EMI PAID DATE column: {emi_date_col}")
            logger.info("First 5 values:")
            for value in df[emi_date_col].head(5):
                logger.info(f"- {value}")
                
            # Show more details about the dates
            logger.info("\nDate statistics:")
            logger.info(f"Number of non-null dates: {df[emi_date_col].notna().sum()}")
            logger.info(f"First date: {df[emi_date_col].min()}")
            logger.info(f"Last date: {df[emi_date_col].max()}")
            logger.info(f"Unique dates: {df[emi_date_col].nunique()}")
            
            # Show date distribution
            logger.info("\nDate distribution by year:")
            for year, group in df.groupby(df[emi_date_col].dt.year):
                logger.info(f"Year {year}: {len(group)} records")
                
        else:
            logger.warning("Could not find EMI PAID DATE column")
            
    except Exception as e:
        logger.error(f"Error reading Excel file: {str(e)}")
        logger.error("Full traceback:", exc_info=True)
        
        # Try reading all sheets if MAIN SHEET failed
        try:
            logger.info("\nAttempting to read all sheets as fallback...")
            all_sheets = pd.read_excel(excel_path, sheet_name=None)
            logger.info(f"Available sheets: {list(all_sheets.keys())}")
            
            # Try each sheet
            for sheet_name, sheet_df in all_sheets.items():
                logger.info(f"\nChecking sheet: {sheet_name}")
                logger.info("Columns:")
                for col in sheet_df.columns:
                    logger.info(f"- {col}")
                    
                # Check for EMI PAID DATE in this sheet
                emi_date_col = None
                for col in sheet_df.columns:
                    if 'emi paid date' in str(col).lower():
                        emi_date_col = col
                        break
                
                if emi_date_col:
                    logger.info(f"Found EMI PAID DATE column in {sheet_name}: {emi_date_col}")
                    logger.info("\nFirst 5 values:")
                    for value in sheet_df[emi_date_col].head(5):
                        logger.info(f"- {value}")
                    break
                
        except Exception as e:
            logger.error(f"Error reading all sheets: {str(e)}")
            logger.error("Full traceback:", exc_info=True)

if __name__ == "__main__":
    debug_excel_file()
    
    # Print the log file content
    with open('debug_excel.log', 'r') as f:
        print(f.read())
