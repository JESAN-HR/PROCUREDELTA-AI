from PIL import Image, ImageDraw, ImageFont
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
image=Image.new('RGB',(1240,1754),'white');draw=ImageDraw.Draw(image)
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',32)
lines=['FICTIONAL OCR TEST DOCUMENT','Tender title: Road equipment','Tender ID: OCR-2026-001','Submission deadline: November 10, 2026','Experience requirement: two years','Bid security: BDT 50,000']
for i,line in enumerate(lines):draw.text((70,100+i*80),line,font=font,fill='black')
image.save('tests/fixtures/scan.png')
c=canvas.Canvas('public/fixtures/scanned-fictional.pdf',pagesize=A4);c.drawImage('tests/fixtures/scan.png',0,0,width=A4[0],height=A4[1]);c.save()
