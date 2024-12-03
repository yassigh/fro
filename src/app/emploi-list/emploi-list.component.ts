import { Component, OnInit } from '@angular/core';
import { EmploiService } from '../emploi.service';
import { Emploi } from '../emploi.model';
import { ClasseService } from '../classe.service';
import { ToastrService } from 'ngx-toastr';

interface Classe {
  id: number;
  nom: string;
}

@Component({
  selector: 'app-emploi-list',
  templateUrl: './emploi-list.component.html',
  styleUrls: ['./emploi-list.component.css']
})
export class EmploiListComponent implements OnInit {
  // Variables pour les filtres
  filters = {
    classe: '',
    nomEnseignant: '', 
    titre: '',
    salle: ''
  };

  // Donneees des emplois
  emplois: Emploi[] = [];
  classes: Classe[] = [];
  emploisGroupedByClasse: { classe: string, emplois: Emploi[] }[] = [];

  emploisGroupedByJour: { jour: string, emplois: Emploi[] }[] = [];  

  constructor(
    private emploiService: EmploiService,
    private classeService: ClasseService, private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadClasses();
    this.loadEmplois();
   
  }

  groupEmploisByJour(): void {
    const grouped: { [key: string]: { jour: string, emplois: Emploi[] } } = {};

    this.emplois.forEach(emploi => {
      const jour = emploi.jour ? emploi.jour : 'Non spécifié';  

      if (!grouped[jour]) {
        grouped[jour] = { jour: jour, emplois: [] };
      }
      grouped[jour].emplois.push(emploi);
    });

    // Convert grouped data into a list
    this.emploisGroupedByJour = Object.values(grouped);
  }

  loadClasses(): void {
    this.classeService.getClasses().subscribe(
      (classes: Classe[]) => {
        this.classes = classes;
        console.log('Classes chargées:', this.classes);
  
        // Assigner la classe aux emplois
        this.emplois.forEach(emploi => {
          if (typeof emploi.classe === 'number') {
            // Rechercher la classe correspondante si emploi.classe est un identifiant
            const foundClasse = this.classes.find(classe => classe.id === emploi.classe);
            emploi.classe = foundClasse || null; 
          } 
        });
      },
      (error) => {
        console.error('Erreur lors du chargement des classes', error);
      }
    );
  }
  
  loadEmplois(): void {
    this.emploiService.getEmplois(this.filters).subscribe({
      next: (data) => {
        if (data && typeof data === 'object') {
          this.emplois = Object.values(data).flat();
  
          // Pré-traiter les emplois pour garantir que classe est un objet ou null
          this.emplois.forEach(emploi => {
            if (typeof emploi.classe === 'number') {
              const foundClasse = this.classes.find(classe => classe.id === emploi.classe);
              emploi.classe = foundClasse || null;
            } else if (emploi.classe && typeof emploi.classe === 'object') {
              console.log(`Classe déjà associée: ${emploi.classe.nom}`);
            }
          });
  
          this.groupEmploisByJour();
       
        } else {
          console.error("La réponse de l'API n'est pas un objet attendu", data);
        }
      },
      error: (err) => {
        console.error("Erreur lors de la récupération des emplois :", err);
      }
    });
  }
  
  
  applyFilters(): void {
    this.loadEmplois(); 
  }

  deleteEmploi(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer cet emploi?')) {
      this.emploiService.deleteEmploi(id).subscribe(() => {
        this.loadEmplois(); 
      }, (err) => {
        console.error("Erreur lors de la suppression de l'emploi :", err);
      });
    }
  }
}
