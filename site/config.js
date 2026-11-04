/*
 * Réglages du site vitrine : à compléter.
 *  - rfqEmail : adresse qui reçoit les demandes de devis (le formulaire ouvre la messagerie du visiteur
 *               avec la demande pré-remplie). Vide = pas d'envoi par e-mail, la demande est seulement
 *               enregistrée dans l'application (menu « Demandes de devis »).
 *  - phone    : numéro affiché pour les urgences (vide = non affiché).
 */
/*  - directSend : true = la demande est envoyée directement par e-mail via le service FormSubmit (formsubmit.co),
 *               sans ouvrir la messagerie du visiteur. La 1re demande déclenche un e-mail d'activation
 *               à rfqEmail : cliquer sur « Activate Form » une seule fois.
 */
export const SITE = {
  rfqEmail: 'maxrallye@hotmail.fr',
  directSend: true,
  phone: '',
  name: 'Lufkin Gears · Allen Gears – Service'
};
