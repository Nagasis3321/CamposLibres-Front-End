import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRelationshipFormComponent } from './edit-relationship-form.component';

describe('EditRelationshipFormComponent', () => {
  let component: EditRelationshipFormComponent;
  let fixture: ComponentFixture<EditRelationshipFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditRelationshipFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditRelationshipFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
