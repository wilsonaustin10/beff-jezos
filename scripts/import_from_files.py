#!/usr/bin/env python3
"""
Import text files from the scripts/letters/ directory into Supabase.
Just drop .txt files in scripts/letters/ and run this script.
"""

import os
from pathlib import Path
from typing import List
import openai
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv('../.env.local')

# Initialize clients
openai.api_key = os.getenv('OPENAI_API_KEY')
supabase: Client = create_client(
    os.getenv('NEXT_PUBLIC_SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_KEY')
)

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 100) -> List[str]:
    """Simple text chunking"""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start = end - overlap
        if start >= len(text):
            break
    return chunks

def create_embedding(text: str) -> List[float]:
    """Create embedding using OpenAI"""
    client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding

def process_file(filepath: Path):
    """Process a single text file"""
    print(f"\nProcessing {filepath.name}...")
    
    # Extract year from filename if it contains a 4-digit year
    import re
    year_match = re.search(r'(\d{4})', filepath.stem)
    year = int(year_match.group(1)) if year_match else 2020
    
    # Read file
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()
    
    print(f"  Read {len(text)} characters")
    
    # Chunk text
    chunks = chunk_text(text)
    print(f"  Created {len(chunks)} chunks")
    
    # Process each chunk
    for i, chunk in enumerate(chunks):
        print(f"  Processing chunk {i+1}/{len(chunks)}...")
        
        # Create embedding
        embedding = create_embedding(chunk)
        
        # Store in database
        data = {
            "year": year,
            "title": filepath.stem.replace('_', ' ').title(),
            "source_url": f"file://{filepath.name}",
            "content": chunk,
            "embedding": embedding
        }
        
        supabase.table("documents").insert(data).execute()
    
    print(f"✓ Completed {filepath.name}")

def main():
    """Main function"""
    print("Text File Importer for Supabase")
    print("=" * 40)
    
    # Create letters directory if it doesn't exist
    letters_dir = Path(__file__).parent / "letters"
    letters_dir.mkdir(exist_ok=True)
    
    # Find all .txt files
    txt_files = list(letters_dir.glob("*.txt"))
    
    if not txt_files:
        print(f"\nNo .txt files found in {letters_dir}")
        print("\nTo use this script:")
        print("1. Create text files in scripts/letters/")
        print("2. Name them like: 2020_letter.txt, 2021_letter.txt, etc.")
        print("3. Run this script again")
        return
    
    print(f"\nFound {len(txt_files)} text files to import:")
    for f in txt_files:
        print(f"  - {f.name}")
    
    # Process each file
    for filepath in txt_files:
        process_file(filepath)
    
    print("\n✓ All files imported!")
    
    # Show final count
    result = supabase.table("documents").select("count", count="exact").execute()
    print(f"Total documents in database: {result.count}")

if __name__ == "__main__":
    main()