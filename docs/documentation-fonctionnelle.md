# Documentation fonctionnelle

## À quoi sert l'application

L'application calcule la **prime de transport** d'un collaborateur sur un
trimestre.

Le principe : on déclare une fois pour toutes la distance qui sépare le
domicile de chaque lieu de travail, puis on indique où l'on s'est rendu chaque
jour de la période. L'application en déduit le kilométrage total et la prime
correspondante.

Elle s'adresse à un collaborateur qui remplit sa propre déclaration. Il n'y a
ni validation hiérarchique ni circuit d'approbation.

## Vocabulaire

| Terme | Définition |
| --- | --- |
| **Lieu de travail** | Endroit où le collaborateur travaille un jour donné : télétravail, une agence, une mission, ou congés. |
| **Distance** | Distance simple domicile → lieu de travail, en kilomètres. Saisie une fois par lieu. |
| **Aller-retour** | Le double de la distance. Toujours calculé, jamais saisi. |
| **Semaine type** | Les habitudes hebdomadaires : le lieu et le moyen de transport de chaque jour de la semaine. |
| **Période** | Intervalle de trois mois sur lequel porte la déclaration. |
| **Prime** | Montant dû, égal au kilométrage total multiplié par 0,20 €. |

## Les écrans

L'application compte deux écrans, accessibles depuis le menu « Mon espace » de
l'en-tête.

| Écran | Adresse | Rôle |
| --- | --- | --- |
| Tableau de bord | `/` | Déclarer une période et consulter la prime. |
| Configuration | `/configuration` | Définir les distances et la semaine type. |

La configuration alimente le tableau de bord : il est donc naturel de
commencer par elle.

---

## Écran Configuration

### Bloc 1 — Lieux de travail

Six lieux sont proposés, et la liste n'est pas modifiable depuis
l'application :

- Télétravail
- Congés / Férié
- Delia Rennes (61, rue Jean Guéhenno)
- Delia Nantes (11, imp. Juton)
- Mission 1
- Mission 2

**Saisie.** On choisit un lieu, puis on indique sa distance. Le champ distance
n'apparaît qu'une fois le lieu choisi, et le champ aller-retour s'affiche dès
qu'une distance est saisie : il se met à jour tout seul et ne peut pas être
modifié.

**Règles**

1. Un lieu ne porte **qu'une seule distance**. Enregistrer à nouveau le même
   lieu remplace la valeur précédente.
2. Un lieu jamais configuré vaut **0 km**.
3. Le lieu et la distance sont obligatoires : sans eux, rien n'est enregistré.

**Tableau récapitulatif.** Il liste les six lieux, configurés ou non, avec leur
distance et leur aller-retour. Les lieux jamais renseignés y figurent à 0.

### Bloc 2 — Semaine type

Un tableau de sept lignes, du lundi au dimanche. Pour chaque jour, on choisit
un lieu de travail et un moyen de transport (aucun, vélo ou covoiturage).

**Règles**

1. **Samedi et dimanche ne se configurent pas** : leur ligne entière est
   désactivée, figée sur « Congés / Férié » sans moyen de transport.
2. Le bouton **« Appliquer la semaine type »** enregistre la semaine. Elle
   remplace celle enregistrée auparavant.
3. Un jour laissé vide reste vide : il n'y a pas de valeur par défaut.
4. En revenant sur l'écran, le tableau réaffiche la dernière semaine
   enregistrée.

La semaine type est un **gain de temps**, pas une contrainte : elle pré-remplit
le calendrier, qui reste modifiable jour par jour.

---

## Écran Tableau de bord

### Étape 1 — Choisir la période

Deux façons de faire, au choix.

**Par trimestre.** On sélectionne un trimestre (T1 à T4) et une année sur
quatre chiffres. Les deux dates se remplissent alors seules. Par exemple,
T4 2026 donne du 01/10/2026 au 31/12/2026.

**Par les dates.** On saisit directement la date de début, au clavier ou via le
bouton calendrier. La date de fin se complète automatiquement.

Les dates s'écrivent et s'affichent toujours au format **JJ/MM/AAAA**, quelle
que soit la langue du navigateur.

**Règles**

1. La période doit **commencer le premier jour d'un mois**.
2. Elle doit couvrir **exactement trois mois** et se termine donc le dernier
   jour du troisième mois.
3. La date de fin est proposée automatiquement, mais reste modifiable. Si elle
   ne correspond pas à la durée attendue, le message d'erreur indique la date
   qu'il faudrait.
4. Trimestre et année sont facultatifs : ce sont des raccourcis, on peut s'en
   passer et saisir les dates.

Le bouton **« Valider »** construit le calendrier. Si la saisie est invalide,
aucun calendrier n'est affiché.

### Étape 2 — Remplir le calendrier

Le calendrier comporte **une ligne par jour de la période**, bornes comprises —
environ quatre-vingt-dix lignes.

| Colonne | Contenu | Modifiable |
| --- | --- | --- |
| Jour | lundi, mardi… | non |
| Date | JJ/MM/AAAA | non |
| Lieu | Un des six lieux | oui |
| Moyen de transport | Aucun, vélo ou covoiturage | oui |
| Distance aller-retour (km) | Déduite du lieu | non |

**Règles**

1. Si une semaine type existe, elle **pré-remplit les jours ouvrés** selon leur
   jour de la semaine. Sinon, les lignes sont vides.
2. **Samedi et dimanche** sont figés sur « Congés / Férié », sans moyen de
   transport et à 0 km. Cela vaut même si une distance a été enregistrée pour
   « Congés / Férié », et même si la semaine type dit autre chose.
3. La distance d'une ligne est l'**aller-retour du lieu choisi**. Elle se
   recalcule à chaque changement de lieu et ne se saisit jamais.
4. Un lieu sans distance configurée compte pour 0 km.

### Étape 3 — Lire le résultat

Un encadré au-dessus du calendrier affiche en permanence :

- le **total des kilomètres** de la période ;
- la **prime correspondante**, égale au total multiplié par **0,20 €**,
  affichée avec deux décimales.

Les deux valeurs se mettent à jour à chaque modification du calendrier.

> Le moyen de transport est enregistré à titre d'information : il **n'entre pas
> dans le calcul** de la prime, qui ne dépend que du kilométrage.

---

## Exemple complet

1. En configuration, on enregistre Delia Rennes à 12 km et le télétravail à
   0 km.
2. On définit une semaine type : télétravail le lundi et le vendredi, Delia
   Rennes du mardi au jeudi, à vélo.
3. Sur le tableau de bord, on choisit T4 2026 — la période 01/10/2026 →
   31/12/2026 s'affiche.
4. Le calendrier se remplit : chaque mardi, mercredi et jeudi porte Delia
   Rennes et 24 km ; les lundis et vendredis, 0 km ; les week-ends, 0 km.
5. On corrige à la main les quelques jours qui ont dérogé à l'habitude.
6. L'encadré affiche le total et la prime, par exemple 936 km et 187,20 €.

---

## Ce que l'application ne fait pas encore

Ces limites sont connues et assumées à ce stade.

**Rien n'est conservé.** Les distances, la semaine type et le calendrier vivent
en mémoire du navigateur. **Un rechargement de la page efface tout.** Il n'y a
ni compte utilisateur réel, ni base de données, ni service distant — l'identité
affichée dans l'en-tête est figée.

**Le calendrier ne s'enregistre pas.** Il n'existe aucun bouton pour valider
une déclaration : le calendrier sert au calcul, à l'écran, et rien n'en sort.

**Le calendrier se réinitialise** dans deux cas : quand on valide une nouvelle
période, et quand on applique une nouvelle semaine type. Les corrections
saisies à la main sont alors perdues.

**Les jours fériés ne sont pas gérés.** Seuls les samedis et dimanches sont
traités automatiquement. Un jour férié en semaine doit être passé à la main sur
« Congés / Férié ».

**La liste des lieux est figée** dans le code : on ne peut ni en ajouter, ni en
renommer, ni en supprimer depuis l'application.

**La durée est toujours de trois mois.** Il n'est pas possible de déclarer un
mois seul ou une année entière.
