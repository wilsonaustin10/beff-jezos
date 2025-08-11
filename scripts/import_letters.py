#!/usr/bin/env python3
"""
Direct importer for Jeff Bezos shareholder letters into Supabase pgvector.
This script downloads letters from Amazon IR and loads them directly into the database.
"""

import os
import requests
from typing import List, Dict
import openai
from supabase import create_client, Client
from langchain.text_splitter import RecursiveCharacterTextSplitter
import PyPDF2
from io import BytesIO

# Load environment variables
from dotenv import load_dotenv
load_dotenv('../.env.local')

# Initialize clients
openai.api_key = os.getenv('OPENAI_API_KEY')
supabase: Client = create_client(
    os.getenv('NEXT_PUBLIC_SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_KEY')
)

# Shareholder letters data (URLs to Amazon's investor relations PDFs)
# Complete collection from 1997-2020 (Bezos's tenure as CEO)
LETTERS = [
    {
        "year": 1997,
        "title": "1997 Letter to Shareholders",
        "url": "https://s2.q4cdn.com/299287126/files/doc_financials/annual/Shareholderletter97.pdf"
    },
    {
        "year": 1998,
        "title": "1998 Letter to Shareholders", 
        "url": "https://s2.q4cdn.com/299287126/files/doc_financials/annual/Shareholderletter98.pdf"
    },
    {
        "year": 1999,
        "title": "1999 Letter to Shareholders",
        "url": "https://s2.q4cdn.com/299287126/files/doc_financials/annual/Shareholderletter99.pdf"
    },
    {
        "year": 2000,
        "title": "2000 Letter to Shareholders",
        "url": "https://s2.q4cdn.com/299287126/files/doc_financials/annual/Shareholderletter00.pdf"
    },
    {
        "year": 2001,
        "title": "2001 Letter to Shareholders",
        "url": "https://s2.q4cdn.com/299287126/files/doc_financials/annual/Shareholderletter01.pdf"
    },
    {
        "year": 2002,
        "title": "2002 Letter to Shareholders",
        "url": "https://s2.q4cdn.com/299287126/files/doc_financials/annual/Shareholderletter02.pdf"
    },
    {
        "year": 2003,
        "title": "2003 Letter to Shareholders",
        "url": "https://s2.q4cdn.com/299287126/files/doc_financials/annual/Shareholderletter03.pdf"
    },
    {
        "year": 2004,
        "title": "2004 Letter to Shareholders",
        "url": "https://s2.q4cdn.com/299287126/files/doc_financials/annual/Shareholderletter04.pdf"
    },
    {
        "year": 2005,
        "title": "2005 Letter to Shareholders",
        "url": "https://s2.q4cdn.com/299287126/files/doc_financials/annual/Shareholderletter05.pdf"
    },
    {
        "year": 2006,
        "title": "2006 Letter to Shareholders",
        "url": "https://s2.q4cdn.com/299287126/files/doc_financials/annual/Shareholderletter06.pdf"
    },
    {
        "year": 2007,
        "title": "2007 Letter to Shareholders",
        "url": "https://s2.q4cdn.com/299287126/files/doc_financials/annual/Shareholderletter07.pdf"
    },
    {
        "year": 2008,
        "title": "2008 Letter to Shareholders",
        "url": "https://s2.q4cdn.com/299287126/files/doc_financials/annual/Shareholderletter08.pdf"
    },
    {
        "year": 2009,
        "title": "2009 Letter to Shareholders",
        "url": "https://s2.q4cdn.com/299287126/files/doc_financials/annual/Shareholderletter09.pdf"
    },
    {
        "year": 2010,
        "title": "2010 Letter to Shareholders",
        "url": "https://s2.q4cdn.com/299287126/files/doc_financials/annual/Shareholderletter10.pdf"
    },
    {
        "year": 2011,
        "title": "2011 Letter to Shareholders",
        "url": "https://s2.q4cdn.com/299287126/files/doc_financials/annual/Shareholderletter11.pdf"
    },
    {
        "year": 2012,
        "title": "2012 Letter to Shareholders",
        "url": "https://s2.q4cdn.com/299287126/files/doc_financials/annual/Shareholderletter12.pdf"
    },
    {
        "year": 2013,
        "title": "2013 Letter to Shareholders",
        "url": "https://s2.q4cdn.com/299287126/files/doc_financials/annual/Shareholderletter13.pdf"
    },
    {
        "year": 2014,
        "title": "2014 Letter to Shareholders",
        "url": "https://s2.q4cdn.com/299287126/files/doc_financials/annual/Shareholderletter14.pdf"
    },
    {
        "year": 2015,
        "title": "2015 Letter to Shareholders",
        "url": "https://s2.q4cdn.com/299287126/files/doc_financials/annual/Shareholderletter15.pdf"
    },
    {
        "year": 2016,
        "title": "2016 Letter to Shareholders",
        "url": "https://s2.q4cdn.com/299287126/files/doc_financials/annual/2016-Letter-to-Shareholders.pdf"
    },
    {
        "year": 2017,
        "title": "2017 Letter to Shareholders",
        "url": "https://s2.q4cdn.com/299287126/files/doc_financials/annual/Shareholderletter17.pdf"
    },
    {
        "year": 2018,
        "title": "2018 Letter to Shareholders",
        "url": "https://s2.q4cdn.com/299287126/files/doc_financials/annual/Shareholderletter18.pdf"
    },
    {
        "year": 2019,
        "title": "2019 Letter to Shareholders",
        "url": "https://s2.q4cdn.com/299287126/files/doc_financials/2020/ar/2019-Shareholder-Letter.pdf"
    },
    {
        "year": 2020,
        "title": "2020 Letter to Shareholders",
        "url": "https://s2.q4cdn.com/299287126/files/doc_financials/2021/ar/Amazon-2020-Shareholder-Letter.pdf"
    }
]

def download_pdf(url: str) -> bytes:
    """Download PDF from URL"""
    print(f"Downloading from {url}...")
    response = requests.get(url)
    response.raise_for_status()
    return response.content

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract text from PDF bytes"""
    pdf_file = BytesIO(pdf_bytes)
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    
    text = ""
    for page_num in range(len(pdf_reader.pages)):
        page = pdf_reader.pages[page_num]
        text += page.extract_text() + "\n"
    
    return text

def chunk_text(text: str) -> List[str]:
    """Split text into chunks for embedding"""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=100,
        separators=["\n\n", "\n", ". ", " ", ""]
    )
    return splitter.split_text(text)

def create_embedding(text: str) -> List[float]:
    """Create embedding using OpenAI"""
    response = openai.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding

def store_document(year: int, title: str, source_url: str, content: str, embedding: List[float]):
    """Store document chunk in Supabase"""
    data = {
        "year": year,
        "title": title,
        "source_url": source_url,
        "content": content,
        "embedding": embedding
    }
    
    result = supabase.table("documents").insert(data).execute()
    return result

def process_letter(letter_info: Dict):
    """Process a single shareholder letter"""
    print(f"\nProcessing {letter_info['year']} - {letter_info['title']}")
    
    try:
        # Download PDF
        pdf_bytes = download_pdf(letter_info['url'])
        
        # Extract text
        text = extract_text_from_pdf(pdf_bytes)
        print(f"Extracted {len(text)} characters")
        
        # Chunk text
        chunks = chunk_text(text)
        print(f"Created {len(chunks)} chunks")
        
        # Process each chunk
        for i, chunk in enumerate(chunks):
            print(f"  Processing chunk {i+1}/{len(chunks)}...")
            
            # Create embedding
            embedding = create_embedding(chunk)
            
            # Store in database
            store_document(
                year=letter_info['year'],
                title=letter_info['title'],
                source_url=letter_info['url'],
                content=chunk,
                embedding=embedding
            )
        
        print(f"✓ Successfully processed {letter_info['year']} letter")
        
    except Exception as e:
        print(f"✗ Error processing {letter_info['year']}: {str(e)}")

def main():
    """Main function to import all letters"""
    print("Starting import of Jeff Bezos shareholder letters...")
    print(f"Found {len(LETTERS)} letters to process")
    
    # Check if table is empty
    result = supabase.table("documents").select("count", count="exact").execute()
    if result.count > 0:
        response = input(f"Database already contains {result.count} documents. Continue? (y/n): ")
        if response.lower() != 'y':
            print("Aborting.")
            return
    
    # Process each letter
    for letter in LETTERS:
        process_letter(letter)
    
    print("\n✓ Import complete!")
    
    # Show final count
    result = supabase.table("documents").select("count", count="exact").execute()
    print(f"Total documents in database: {result.count}")

if __name__ == "__main__":
    main()