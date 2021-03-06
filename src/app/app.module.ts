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
import { ChatFeedComponent } from './components/chat-feed/chat-feed.component';
import { FooterComponent } from './components/footer/footer.component';
import { SmartDatePipe } from './pipe/smart-date.pipe';
import { RelativeDatePipe } from './pipe/relative-date.pipe';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { ScrollableDirective } from './directives/scrollable.directive';
import { ActivityComponent } from './components/activity/activity.component';
import { FriendInfoComponent } from './components/friend-info/friend-info.component';
import { MygroupComponent } from './components/mygroup/mygroup.component';
import { GroupMenuComponent } from './components/group-menu/group-menu.component';
import { AddMemberComponent } from './components/add-member/add-member.component';
import { GroupInfoComponent } from './components/group-info/group-info.component';
import { RemoveMemberComponent } from './components/remove-member/remove-member.component';
import { GroupChatFeedComponent } from './components/group-chat-feed/group-chat-feed.component';
import { NotificationsComponent } from './components/notifications/notifications.component';


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
    ChatFeedComponent,
    FooterComponent,
    SmartDatePipe,
    RelativeDatePipe,
    LoadingSpinnerComponent,
    ScrollableDirective,
    ActivityComponent,
    FriendInfoComponent,
    MygroupComponent,
    GroupMenuComponent,
    AddMemberComponent,
    GroupInfoComponent,
    RemoveMemberComponent,
    GroupChatFeedComponent,
    NotificationsComponent
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
  entryComponents: [
    LoadingSpinnerComponent,
    AddMemberComponent,
    GroupInfoComponent,
    RemoveMemberComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
