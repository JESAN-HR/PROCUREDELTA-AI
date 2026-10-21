from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.platypus import Paragraph, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from pypdf import PdfReader
from pathlib import Path
import shutil
OUT=Path('output/pdf'); W,H=A4
body=ParagraphStyle('body',fontName='Times-Roman',fontSize=10.5,leading=14)
small=ParagraphStyle('small',fontName='Helvetica',fontSize=9,leading=12)
def p(c,text,x,y,w,style=body):
    para=Paragraph(text,style); _,h=para.wrap(w,800); para.drawOn(c,x,y-h); return y-h-10

def header(c,number,doc):
    c.setFillColor(colors.HexColor('#ececec'));c.rect(35,H-43,W-70,21,fill=1,stroke=0)
    c.setFillColor(colors.black);c.setFont('Helvetica-Bold',8)
    c.drawCentredString(W/2,H-35,'FICTIONAL TEST DOCUMENT - NOT AN OFFICIAL PROCUREMENT RECORD')
    c.setFont('Times-Bold',13);c.drawCentredString(W/2,H-66,'NORTH DELTA MUNICIPAL WORKS UNIT (FICTIONAL)')
    c.setFont('Helvetica',8);c.drawString(42,H-84,'File: ND/MW/26-041     |     Procurement section / mechanical works')
    c.line(42,H-93,W-42,H-93)
    c.setFont('Helvetica',8);c.drawString(42,30,doc+'  |  Synthetic data for parser testing only')
    c.drawRightString(W-42,30,f'Page {number}')

def table(c,rows,widths,y):
    data=[[Paragraph(str(v),small) for v in row] for row in rows]
    t=Table(data,colWidths=widths)
    t.setStyle(TableStyle([('GRID',(0,0),(-1,-1),.5,colors.grey),('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e5e5e5')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8)]))
    _,h=t.wrap(sum(widths),700);t.drawOn(c,42,y-h);return y-h-15

c=canvas.Canvas(str(OUT/'messy-original-tender.pdf'),pagesize=A4)
c.setTitle('Fictional messy tender - original')
header(c,1,'ORIGINAL NOTICE')
y=H-115
y=p(c,'INVITATION FOR SEALED OFFERS<br/>Supply, delivery and commissioning of road-maintenance equipment',42,y,W-84,ParagraphStyle('title',parent=body,fontSize=15,leading=19))
y=p(c,'Notice circulated on 20 October 2026. The Municipal Works Unit invites offers under procurement reference <b>ND-MW-2026-041</b>. This notice, the schedule on page 2 and the instructions below are to be read together.',42,y,W-84)
y=table(c,[['Item / lot','Description and minimum scope','Quantity'],['Lot 01 / A','Vibratory road compactors, including operating manuals, initial training and delivery to the municipal depot.','02 units'],['Lot 01 / B','Consumables and standard service kit for the equipment above. This is included in the quoted lot price.','01 set']], [85,340,W-84-425],y)
y=p(c,'1. RECEIPT AND OPENING OF OFFERS',42,y,W-84)
y=p(c,'Completed offers must reach the receiving desk <b>no later than 14:00 hours on 10 November 2026</b> (Bangladesh local time, UTC+06:00). The public opening will take place at 14:30 hours on that same date. Documents received after the closing time will be returned unopened.',42,y,W-84)
y=p(c,'2. PARTICIPATION AND EXPERIENCE',42,y,W-84)
y=p(c,'Suppliers must hold current trade registration and tax clearance. A bidder shall demonstrate <b>not less than two (2) years</b> of experience supplying comparable road-maintenance machinery. Joint ventures are permitted, provided the lead member accepts responsibility for delivery and warranty support.',42,y,W-84)
y=p(c,'A manufacturer authorization letter is required. Each bidder shall also hold a valid <b>ISO 9001 certificate</b> at the date of submission. Copies should be attached in the technical envelope, not included in the price schedule.',42,y,W-84)
y=p(c,'See page 2 for security, delivery, financial conditions and the document checklist. The notice publication date is not the deadline for submitting offers.',42,y,W-84,small)
c.showPage();header(c,2,'ORIGINAL NOTICE / CONTINUED');y=H-116
y=p(c,'SCHEDULE B - FINANCIAL AND DELIVERY CONDITIONS',42,y,W-84,ParagraphStyle('section',parent=body,fontName='Times-Bold',fontSize=13,leading=16))
y=table(c,[['Clause','Requirement','Notes / cross-reference'],['B.1','The indicative allocation for the entire lot is BDT 2,500,000.','This is an estimate, not a disclosed winning bid.'],['B.2','Enclose bid security of BDT 50,000, valid for 90 days after closing.','Bank instrument in a separate sealed envelope.'],['B.3','Complete delivery within 45 calendar days of the purchase order.','Delivery period starts on the order date, not the publication date.'],['B.4','Payment will be made within 30 days after acceptance of the delivered goods.','Acceptance follows inspection and commissioning.']], [48,270,W-84-318],y)
y=p(c,'3. TECHNICAL SUPPORT AND DOCUMENT CHECKLIST',42,y,W-84)
left=y
p(c,'<b>Technical envelope</b><br/>- Product specification sheets<br/>- Manufacturer authorization<br/>- Trade and tax documents<br/>- Experience records<br/>- ISO 9001 certificate',42,left,235)
p(c,'<b>Commercial envelope</b><br/>- Signed price schedule<br/>- Bid security instrument<br/>- Proposed delivery programme<br/><br/>The technical and commercial envelopes must be separately sealed.',310,left,W-352)
y=left-145
y=p(c,'4. INTERPRETATION OF SUBSEQUENT NOTICES',42,y,W-84)
y=p(c,'Any subsequently issued corrigendum must be read with this invitation. A corrigendum may replace a specific clause without reproducing the entire notice. Unless expressly changed, the other conditions continue to apply.',42,y,W-84)
y=p(c,'Administrative note: questions may be submitted before 03 November 2026. This enquiry date is separate from the offer closing date. No contact address in this fictional notice represents a real institution.',42,y,W-84,small)
c.save()

c=canvas.Canvas(str(OUT/'messy-amendment-notice.pdf'),pagesize=A4)
c.setTitle('Fictional messy tender - partial amendment')
header(c,1,'CORRIGENDUM NO. 01');y=H-116
y=p(c,'CORRIGENDUM / AMENDMENT NOTICE<br/>Reference ND-MW-2026-041, issued 28 October 2026',42,y,W-84,ParagraphStyle('title2',parent=body,fontName='Times-Bold',fontSize=14,leading=18))
y=p(c,'This notice amends the invitation dated 20 October 2026 for road-maintenance equipment. It is <b>not a complete replacement tender</b>. Apply the substitutions below to the referenced clauses. All provisions not expressly amended remain unchanged.',42,y,W-84)
y=table(c,[['Reference','Existing wording / figure','Read instead / operative revision'],['Page 1, clause 1','10 November 2026, at 14:00 hours','17 November 2026, at 14:00 hours. Opening will follow at 14:30 hours on the revised closing date.'],['Page 1, clause 2','not less than two (2) years','not less than three (3) years of comparable supply experience'],['Page 2, B.2','BDT 50,000','BDT 75,000. The security validity period remains 90 days after closing.'],['Page 2, B.3','within 45 calendar days','within 60 calendar days of the purchase order']], [85,175,W-84-260],y)
y=p(c,'ADDITIONAL INSTRUCTIONS TO BIDDERS',42,y,W-84)
y=p(c,'(a) Insert the following condition after the experience provision: <b>At least one completed comparable supply contract with a value of BDT 1,000,000 or more</b> must be evidenced by an acceptance certificate. This amount is a qualification threshold, not a revision to the procurement allocation.',42,y,W-84)
y=p(c,'(b) Delete the requirement to hold an <b>ISO 9001 certificate</b>, including its corresponding checklist entry. The requirements for trade registration, tax clearance and manufacturer authorization are retained.',42,y,W-84)
y=p(c,'(c) For avoidance of doubt, the indicative allocation remains <b>BDT 2,500,000</b>. The scope, quantities, payment terms and joint-venture permission are unchanged. Those clauses are not reproduced in full here.',42,y,W-84)
y=p(c,'Read both documents together. Historical dates and figures in the middle column above identify the text being replaced; they are not alternative current requirements.',42,y,W-84,small)
c.save()

for file in OUT.glob('messy-*.pdf'):
    reader=PdfReader(file)
    texts=[page.extract_text() for page in reader.pages]
    assert all(text.strip() for text in texts)
    print(f'{file}: {len(texts)} pages, {sum(map(len,texts))} extractable characters')
    shutil.copyfile(file,Path('public/fixtures')/file.name)
