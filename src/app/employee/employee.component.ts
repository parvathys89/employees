import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition, MatPaginator, MatSort, MatDialog, MatSnackBar, MatTableDataSource } from '@angular/material';
import { Employee } from '../employee';
import { EmployeeService } from '../employee.service';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit {
  employeeForm: any;
  dataSaved:boolean = false;
  employeeIdUpdate = null;
  dataSource: MatTableDataSource<Employee>;
  isMale = true;
  isFeMale = false;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  emailPattern = '^[A-Za-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$';
  mobileNumberPattern = '[0-9]{10,15}$';
  displayedColumns: string[] = ['name', 'email','avatar', 'gender', 'mobile',  'address', 'company','position', 'Edit', 'Delete'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(private formbulider: FormBuilder, private employeeService: EmployeeService, private snackBar: MatSnackBar, public dialog: MatDialog) { 
  }

  ngOnInit() {
    this.loadAllEmployees();
    this.employeeForm = this.formbulider.group({
      name: ['', [Validators.required]],
      avatar: ['', [Validators.required]],
      address: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(this.emailPattern)]],
      gender: ['', [Validators.required]],
      company: ['', [Validators.required]],
      position: ['', [Validators.required]],
      mobile: ['', [Validators.required]]
    });
    this.loadAllEmployees();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
  }
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  loadAllEmployees() {
    this.employeeService.getAllEmployee().subscribe(data => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }
  deleteEmployee(employeeId: string) {
    if (confirm("Are you sure you want to delete this ?")) {
      this.employeeService.deleteEmployeeById(employeeId).subscribe(() => {
        this.dataSaved = true;
        this.loadAllEmployees();
        this.employeeIdUpdate = null;
        alert("Successfully deleted")
      });
    }
  }

  loadEmployeeToEdit(employeeId: string) {
    this.employeeService.getEmployeeById(employeeId).subscribe(employee => {
      this.dataSaved = false;
      this.employeeIdUpdate = employee.id;
      this.employeeForm.controls['name'].setValue(employee.name);
      this.employeeForm.controls['email'].setValue(employee.email);
      this.employeeForm.controls['avatar'].setValue(employee.avatar);
      this.employeeForm.controls['gender'].setValue(employee.gender);
      this.employeeForm.controls['address'].setValue(employee.address);
      this.employeeForm.controls['company'].setValue(employee.company);
      this.employeeForm.controls['mobile'].setValue(employee.mobile);
      this.employeeForm.controls['position'].setValue(employee.position);
      this.isMale = employee.gender.trim() == "0" ? true : false;
      this.isFeMale = employee.gender.trim() == "1" ? true : false;
    });

  }

  onFormSubmit() {
    this.dataSaved = false;
    const employee = this.employeeForm.value;
    this.CreateEmployee(employee);
    this.employeeForm.reset();
  }

  CreateEmployee(employee: Employee) {
    if (this.employeeIdUpdate == null) {
      this.employeeService.createEmployee(employee).subscribe(
        () => {
          this.dataSaved = true;
          this.loadAllEmployees();
          this.employeeIdUpdate = null;
          this.employeeForm.reset();
          alert("Successfully Added");
        }
      );
    } else {
      employee.id = this.employeeIdUpdate;
      this.employeeService.updateEmployee(employee).subscribe(() => {
        this.dataSaved = true;
        this.loadAllEmployees();
        this.employeeIdUpdate = null;
        this.employeeForm.reset();
        alert("Successfully Updated");
      });
    }
  }
}
