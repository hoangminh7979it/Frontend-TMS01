import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ThemeService, ThemeMode } from '@core/services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  loading: boolean = false;
  showPassword: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  currentTheme: ThemeMode = 'dark';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public themeService: ThemeService,
    private router: Router
  ) {}


  ngOnInit(): void {
    this.initForm();
    this.themeService.currentTheme$.subscribe(theme => {
      this.currentTheme = theme;
    });
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }


  private initForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.successMessage = `Xin chào ${res.data.firstname || res.data.username}! Đăng nhập thành công.`;
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1200);
        } else {
          this.errorMessage = res.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.';
        }
      },
      error: (err) => {
        this.loading = false;
        if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else if (err.status === 0) {
          this.errorMessage = 'Không thể kết nối đến máy chủ Backend (TMS-01). Vui lòng kiểm tra Server.';
        } else {
          this.errorMessage = 'Tài khoản hoặc mật khẩu không chính xác.';
        }
      }
    });
  }

  get f() {
    return this.loginForm.controls;
  }
}
