import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

def calculate_similarity(embedding1: np.ndarray, embedding2: np.ndarray) -> float:
    """
    Calculate the cosine similarity between two embeddings.
    Both embeddings should be 1D numpy arrays.
    """
    # Reshape to 2D arrays (1 sample, n features) as expected by sklearn
    emb1 = embedding1.reshape(1, -1)
    emb2 = embedding2.reshape(1, -1)
    
    # Output is a 2D matrix, get the [0][0] value
    similarity = cosine_similarity(emb1, emb2)[0][0]
    
    return float(similarity)
