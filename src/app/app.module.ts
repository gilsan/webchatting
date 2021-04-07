import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FlexLayoutModule } from '@angular/flex-layout';

// firebase config
import { environment } from 'src/environments/environment';

// firebase
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireFunctionsModule } from '@angular/fire/functions';

// components
import { LoginPageComponent } from './components/login-page/login-page.component';
import { SignupPageComponent } from './components/signup-page/signup-page.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MaterialModule } from './material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthguardService } from './AuthguardService';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { SideBarComponent } from './components/side-bar/side-bar.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AddfriendComponent } from './components/addfriend/addfriend.component';
import { RequestsComponent } from './components/requests/requests.component';
import { MyfriendComponent } from './components/myfriend/myfriend.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    SignupPageComponent,
    DashboardComponent,
    NavBarComponent,
    SideBarComponent,
    ProfileComponent,
    AddfriendComponent,
    RequestsComponent,
    MyfriendComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    FlexLayoutModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireAuthModule,
    AngularFireFunctionsModule,
    MaterialModule,
  ],
  providers: [
    AuthguardService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
