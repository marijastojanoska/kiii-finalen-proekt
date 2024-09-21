import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../service/auth.service";
import {Router, RouterLink} from "@angular/router";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {LoginRequest} from "../../model/request/LoginRequest";
import {NgFor, NgIf} from "@angular/common";

@Component({
    selector: 'login',
    standalone: true,
    imports: [ReactiveFormsModule, NgIf, NgFor, RouterLink],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

    loginForm: FormGroup;
    errorMessage: string | null = null;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });
    }

    ngOnInit(): void {
    }

    onSubmit(): void {
        if (this.loginForm.valid) {
            const loginRequest: LoginRequest = this.loginForm.value;

            this.authService.login(loginRequest).subscribe({
                next: () => this.router.navigate(['/dashboard']),
                error: (error) => this.errorMessage = error.message
            });
        }
    }

}


