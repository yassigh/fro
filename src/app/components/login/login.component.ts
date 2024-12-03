import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { UserService } from 'src/app/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,private userService: UserService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      plainPassword: ['', Validators.required]
    });
  }
  
 
  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('User logged in successfully:', response);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Error:', error);
          this.errorMessage = "Connexion échouée. Vérifiez vos informations d'identification.";
        }
      });
    } else {
      this.errorMessage = 'Veuillez remplir correctement tous les champs.';
    }
  }








  
  
}
