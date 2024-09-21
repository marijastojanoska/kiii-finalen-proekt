import {Component} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router, RouterLink} from "@angular/router";
import {AuthService} from "../../service/auth.service";
import {NgFor, NgIf} from "@angular/common";


@Component({
    selector: 'register',
    standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, RouterLink],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css'
})
export class RegisterComponent {
    registerForm: FormGroup;
    errorMessage: string | null = null;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.registerForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            username: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
            confirmPassword: ['', Validators.required]
        });
    }

    onSubmit(): void {
        if (this.registerForm.valid) {
            if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
                this.errorMessage = 'Passwords do not match';
                return;
            }

            this.authService.register(this.registerForm.value).subscribe({
                next: () => this.router.navigate(['/login']),
                error: (error) => this.errorMessage = error.message
            });
        }
    }
}
