#!/usr/bin/env python3

import psycopg2

def test_broker_data():
    """Test broker data in the database"""
    
    conn = psycopg2.connect(
        dbname='indusun',
        user='postgres', 
        password='1234',
        host='localhost',
        port=5432
    )

    with conn.cursor() as cursor:
        # Test the query that the admin API uses
        cursor.execute("""
            SELECT 
                id,
                full_name,
                normalized_name as name,
                contact_number as phone,
                created_at as "createdAt"
            FROM brokers
            ORDER BY normalized_name ASC
            LIMIT 5
        """)
        
        results = cursor.fetchall()
        print('Sample broker data from database:')
        for row in results:
            print(f'ID: {row[0]}, Name: {row[1]}, Phone: {row[3] or "N/A"}')
        
        # Check total count
        cursor.execute('SELECT COUNT(*) FROM brokers')
        total = cursor.fetchone()[0]
        print(f'\nTotal brokers in database: {total}')
        
        # Check examples with codes
        cursor.execute("""
            SELECT full_name 
            FROM brokers 
            WHERE full_name ~ '[A-Z]+/[0-9]+|[0-9]+/[A-Z]+'
            ORDER BY full_name 
            LIMIT 5
        """)
        
        print('\nBrokers with codes (first 5):')
        for row in cursor.fetchall():
            print(f'  {row[0]}')

    conn.close()

if __name__ == "__main__":
    test_broker_data()
