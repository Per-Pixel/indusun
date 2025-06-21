import os
import csv
from openpyxl import load_workbook
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filename='convert_to_csv.log',
    filemode='a'
)
logger = logging.getLogger(__name__)

# Add console handler for immediate feedback
console = logging.StreamHandler()
console.setLevel(logging.INFO)
logger.addHandler(console)

def convert_excel_to_csv(excel_path, csv_path):
    """Convert Excel MAIN SHEET to CSV file using read-only mode"""
    logger.info(f"Starting conversion of {excel_path} to {csv_path}")
    
    try:
        # Load workbook in read-only mode
        logger.info("Loading workbook in read-only mode...")
        wb = load_workbook(excel_path, read_only=True, data_only=True)
        
        # Get MAIN SHEET
        logger.info("Accessing MAIN SHEET...")
        ws = wb['MAIN SHEET']
        
        # Open CSV file for writing
        logger.info("Opening CSV file for writing...")
        with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
            csv_writer = csv.writer(csvfile)
            
            # Write header (first row)
            logger.info("Writing header row...")
            header_row = next(ws.rows)
            header = [cell.value for cell in header_row]
            csv_writer.writerow(header)
            
            # Skip garbage row (second row)
            logger.info("Skipping garbage row...")
            next(ws.rows)
            
            # Write data rows
            logger.info("Writing data rows...")
            for row_idx, row in enumerate(ws.rows, 1):
                if row_idx % 1000 == 0:
                    logger.info(f"Processed {row_idx} rows...")
                csv_writer.writerow([cell.value for cell in row])
        
        logger.info(f"Successfully converted {excel_path} to {csv_path}")
        
    except Exception as e:
        logger.error(f"Error during conversion: {str(e)}")
        raise
    finally:
        # Close the workbook
        if 'wb' in locals():
            wb.close()

if __name__ == "__main__":
    # Get paths
    excel_path = os.path.join("scripts", "data", "indusun_data.xlsx")
    csv_path = os.path.join("scripts", "data", "indusun_data.csv")
    
    # Create data directory if it doesn't exist
    os.makedirs(os.path.dirname(csv_path), exist_ok=True)
    
    # Convert Excel to CSV
    convert_excel_to_csv(excel_path, csv_path)
