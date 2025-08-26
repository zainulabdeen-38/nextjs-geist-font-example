import openpyxl
from openpyxl import Workbook
import os

# Create data directory if it doesn't exist
data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
os.makedirs(data_dir, exist_ok=True)

def create_excel_file(filename, headers):
    """Create Excel file with headers"""
    filepath = os.path.join(data_dir, filename)
    wb = Workbook()
    ws = wb.active
    
    # Add headers
    for col, header in enumerate(headers, 1):
        ws.cell(row=1, column=col, value=header)
    
    wb.save(filepath)
    print(f"Created {filename}")

# Create all Excel files
create_excel_file('patients.xlsx', [
    'id', 'name', 'age', 'gender', 'phone', 'email', 'address', 
    'medical_history', 'allergies', 'emergency_contact', 'created_date'
])

create_excel_file('appointments.xlsx', [
    'id', 'patient_id', 'patient_name', 'appointment_date', 'appointment_time',
    'status', 'reason', 'notes', 'created_date'
])

create_excel_file('billing.xlsx', [
    'id', 'patient_id', 'patient_name', 'service_description', 'amount',
    'status', 'payment_method', 'bill_date', 'due_date', 'created_date'
])

create_excel_file('reports.xlsx', [
    'id', 'patient_id', 'patient_name', 'report_type', 'diagnosis',
    'treatment', 'medications', 'follow_up_date', 'created_date'
])

create_excel_file('prescriptions.xlsx', [
    'id', 'patient_id', 'patient_name', 'medication_name', 'dosage',
    'frequency', 'duration', 'instructions', 'prescribed_date'
])

print("All Excel files created successfully!")
