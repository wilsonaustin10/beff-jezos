#!/usr/bin/env python3
"""
Simple text importer for testing the pipeline.
Put your text files in scripts/letters/ directory and run this script.
"""

import os
from typing import List
import openai
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables from parent directory
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
    return chunks

def create_embedding(text: str) -> List[float]:
    """Create embedding using OpenAI"""
    client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding

def main():
    """Main function"""
    print("Simple Text Importer for Bezos Letters")
    print("=" * 40)
    
    # Sample text for testing
    sample_text = """
    It remains Day 1. This is Jeff Bezos' 2016 letter to shareholders.
    
    Jeff, what does Day 2 look like? That's a question I just got at our most recent all-hands meeting. 
    I've been reminding people that it's Day 1 for a couple of decades. I work in an Amazon building 
    named Day 1, and when I moved buildings, I took the name with me. I spend time thinking about this topic.
    
    Day 2 is stasis. Followed by irrelevance. Followed by excruciating, painful decline. 
    Followed by death. And that is why it is always Day 1.
    
    To be sure, this kind of decline would happen in extreme slow motion. An established company might 
    harvest Day 2 for decades, but the final result would still come.
    
    I'm interested in the question, how do you fend off Day 2? What are the techniques and tactics? 
    How do you keep the vitality of Day 1, even inside a large organization?
    
    Such a question can't have a simple answer. There will be many elements, multiple paths, and many 
    traps. I don't know the whole answer, but I may know bits of it. Here's a starter pack of essentials 
    for Day 1 defense: customer obsession, a skeptical view of proxies, the eager adoption of external 
    trends, and high-velocity decision making.
    """
    
    print(f"Sample text length: {len(sample_text)} characters")
    
    # Chunk the text
    chunks = chunk_text(sample_text)
    print(f"Created {len(chunks)} chunks")
    
    # Process each chunk
    for i, chunk in enumerate(chunks):
        print(f"\nProcessing chunk {i+1}/{len(chunks)}...")
        print(f"Chunk preview: {chunk[:50]}...")
        
        # Create embedding
        embedding = create_embedding(chunk)
        print(f"Created embedding with {len(embedding)} dimensions")
        
        # Store in database
        data = {
            "year": 2016,
            "title": "2016 Letter to Shareholders (Sample)",
            "source_url": "https://example.com",
            "content": chunk,
            "embedding": embedding
        }
        
        result = supabase.table("documents").insert(data).execute()
        print(f"✓ Stored in database")
    
    print("\n✓ Import complete!")
    
    # Verify by querying
    result = supabase.table("documents").select("count", count="exact").execute()
    print(f"Total documents in database: {result.count}")

if __name__ == "__main__":
    main()