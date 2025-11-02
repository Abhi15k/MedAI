import { Routes } from '@angular/router';
import { PostListComponent } from './components/post-list/post-list';
import { PostFormComponent } from './components/post-form/post-form';

export const routes: Routes = [
  { path: '', redirectTo: '/posts', pathMatch: 'full' },
  { path: 'posts', component: PostListComponent },
  { path: 'posts/new', component: PostFormComponent },
  { path: 'posts/edit/:id', component: PostFormComponent }
];
