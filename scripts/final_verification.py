#!/usr/bin/env python3

import psycopg2

def final_verification():
    """Final verification that the broker cleanup was successful"""
    
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
            LIMIT 10
        """)
        
        results = cursor.fetchall()
        print('Sample broker data (first 10):')
        for row in results:
            print(f'  ID: {row[0]}, Name: {row[1]}, Phone: {row[3] or "N/A"}')
        
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
        
        # Check examples without codes
        cursor.execute("""
            SELECT full_name 
            FROM brokers 
            WHERE full_name !~ '[A-Z]+/[0-9]+|[0-9]+/[A-Z]+'
            ORDER BY full_name 
            LIMIT 5
        """)
        
        print('\nBrokers without codes (first 5):')
        for row in cursor.fetchall():
            print(f'  {row[0]}')
        
        # Final counts
        cursor.execute("SELECT COUNT(*) FROM brokers")
        total = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(DISTINCT full_name) FROM brokers")
        unique = cursor.fetchone()[0]
        
        print(f'\nFinal Summary:')
        print(f'  Total brokers: {total}')
        print(f'  Unique names: {unique}')
        print(f'  Status: {"✅ CLEAN" if total == unique else "❌ DUPLICATES REMAIN"}')

    conn.close()

if __name__ == "__main__":
    final_verification()
