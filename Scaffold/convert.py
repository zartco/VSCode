import os
import glob
from fpdf import FPDF

txt_files = glob.glob('*.txt')
for txt_file in txt_files:
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=10)
    
    with open(txt_file, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.replace('\u2014', '-').replace('\u2013', '-').replace('\u201c', '"').replace('\u201d', '"').replace('\u2018', "'").replace('\u2019', "'")
            # Fallback for any other non-latin1 chars
            line = line.encode('latin-1', 'replace').decode('latin-1')
            pdf.multi_cell(0, 5, text=line)
            
    pdf_file = txt_file.replace('.txt', '.pdf')
    pdf.output(pdf_file)
    print(f"Converted {txt_file} to {pdf_file}")
