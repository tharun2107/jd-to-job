# Setup Instructions

## Missing Dependencies Fix

The following dependencies were missing from `requirements.txt` and have been added:

1. **PyMuPDF** - For PDF parsing (fitz module)
2. **rapidfuzz** - For fuzzy string matching
3. **transformers** - For BERT NER (already used in extractor.py)

## Installation Steps

1. **Activate your virtual environment** (if not already activated):
   ```bash
   cd ats-skill-analyzer
   venv\Scripts\activate  # Windows
   # or
   source venv/bin/activate  # Linux/Mac
   ```

2. **Install all dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Download spaCy language model** (if not already done):
   ```bash
   python -m spacy download en_core_web_sm
   ```

4. **Run the application**:
   ```bash
   python app/main.py
   ```

## First Run Notes

- The BERT model for semantic matching will download automatically on first use (~90MB)
- The transformers NER model will download on first use if available
- Subsequent runs will be faster due to caching

## Troubleshooting

### If you get "ModuleNotFoundError: No module named 'fitz'"
- Install PyMuPDF: `pip install PyMuPDF`

### If you get "ModuleNotFoundError: No module named 'rapidfuzz'"
- Install rapidfuzz: `pip install rapidfuzz`

### If you get "ModuleNotFoundError: No module named 'transformers'"
- Install transformers: `pip install transformers`

### If semantic matching doesn't work
- Install sentence-transformers: `pip install sentence-transformers scikit-learn torch`
- Note: This is optional - the system will fall back to fuzzy-only matching if not available

