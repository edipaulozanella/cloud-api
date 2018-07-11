// import stripePackage from "stripe";
// var public_key = "pk_test_Gba6sLZso9aWOJA5V1apB012";
// var private_key = "sk_test_tbgYivJd3qtY836Stz8kMzHN";
// //producao
// var public_key = "pk_live_A4EH20FZrNfPJELc4zViY5WT";
// var private_key = "rk_live_UcvneXAHWgEiT5r5Dh4m1gVi";
// ///rk_live_rcqCFOdLpILQhM6ylS1WOxBH
//
// var stripe = stripePackage(private_key);
//
// export function registrarRecebedor() {
//   ///
// }
// export function registrarBanco() {
//   stripe.tokens.create(
//     {
//       bank_account: {
//         country: "BR",
//         currency: "BRL",
//         account_holder_name: "Edipaulo Zanella",
//         account_holder_type: "individual",
//         routing_number: "110000000",
//         account_number: "000123456789"
//       }
//     },
//     function(err, token) {
//       //   console.log(err, token);
//       console.log(token);
//     }
//   );
// }
// // registrarBanco()
// export function pagar(amount) {
//   registrarCartao((token, err) => {
//     if (err) return;
//     var id_card = token.id;
//     console.log(token, amount);
//     executarPagamento(amount, id_card, (data, err) => {
//       console.log("status paid:", data, err);
//     });
//   });
// }
// function executarPagamento(amount, id_card, callback) {
//   var stripe = stripePackage(private_key);
//   // id: 'btok_1C0sxRElCjtiVQnSdjq7giSF',
//   //  id: 'ba_1C0sxRElCjtiVQnSXybAaodu',
//   stripe.charges.create(
//     {
//       amount: amount,
//       currency: "brl",
//       source: id_card,
//       description: "Charge for sofia.jones@example.com"
//     },
//     function(err, charge) {
//       if (callback) callback(charge, err);
//     }
//   );
// }
//
// export function registrarCartao(callback) {
//   var stripe = stripePackage(public_key);
//   stripe.tokens.create(
//     {
//       card: {
//         number: "4589194607631803",
//         // number: "4242424242424242",
//         exp_month: "09",
//         currency: "brl",
//         exp_year: "2021",
//         cvc: "973"
//       }
//     },
//     function(err, token) {
//       console.log(err, token);
//       callback(token, err);
//       // asynchronously called
//     }
//   );
// }
//
// // pagar(1000);
// var stripe = stripePackage(private_key);
// // stripe.customers.listSources("", { limit: 3, object: "bank_account" }, function(err, bank_accounts) {
// //   console.log(err, bank_accounts);
// // });
//
// // stripe.balance.retrieve(function(err, balance) {
// //   console.log(err, balance, balance.available);
// // });
// // stripe.payouts.create(
// //   {
// //     amount: 400,
// //     currency: "brl"
// //   },
// //   function(err, payout) {
// //     console.log(err, payout);
// //     // asynchronously called
// //   }
// // );
// // stripe.payouts
// //   .create(
// //     {
// //       amount: 100,
// //       currency: "brl"
// //     },
// //     {
// //       stripe_account: "ba_1CXZ1ZFPaQkgfzAjOEJ6xRST"
// //     }
// //   )
// //   .then(function(err, payout) {
// //     console.log(err, payout);
// //     // asynchronously called
// //   });
// stripe.accounts.createExternalAccount(
//   "ac_CxUI37N2OUt9RmfNnZclOtIl3zFNVBWM",
//   {external_account: "btok_1CXZ1ZFPaQkgfzAjE3n9JkYf"}
// );
//
//
// ///
// // var stripe = stripePackage(public_key);
// // //ok funcionando
// // stripe.tokens.create(
// //   {
// //     bank_account: {
// //       country: "BR",
// //       currency: "brl",
// //       account_holder_name: "Edipaulo Zanella",
// //       account_holder_type: "individual", //company
// //             routing_number: "655-0655",
// //       account_number: "379654"
// //     //   routing_number: "779-0001",
// //     //   account_number: "10226834"
// //       //   routing_number: "748-0202",//sicredi
// //       //   account_number: "231380"
// //     }
// //   },
// //   function(err, token) {
// //     console.log(err, token);
// //   }
// // );
//
// // var stripe = stripePackage(public_key);
// // //ok funcionando
// // stripe.tokens.create(
// //   {
// //     bank_account: {
// //       country: "BR",
// //       currency: "brl",
// //       account_holder_name: "Edipaulo Zanella",
// //       account_holder_type: "individual", //company
// //       routing_number: "001-3122-4",
// //       account_number: "35837-1"
//
// //     }
// //   },
// //   function(err, token) {
// //     console.log( err,token);
// //   }
// // );
// // null { id: 'btok_1CXZ1ZFPaQkgfzAjE3n9JkYf',
// //   object: 'token',
// //   bank_account:
// //   { id: 'ba_1CXZ1ZFPaQkgfzAjOEJ6xRST',
// //      object: 'bank_account',
// //      account_holder_name: 'Edipaulo Zanella',
// //      account_holder_type: 'individual',
// //      bank_name: 'BANCO VOTORANTIM S.A.',
// //      country: 'BR',
// //      currency: 'brl',
// //      last4: '9654',
// //      name: 'Edipaulo Zanella',
// //      routing_number: '655-0655',
// //      status: 'new' },
// //   client_ip: '179.124.183.34',
// //   created: 1527704873,
// //   livemode: true,
// //   type: 'bank_account',
// //   used: false }
// // { id: 'btok_1CLBUEElCjtiVQnSFG0OvnAd',
// //   object: 'token',
// //   bank_account:
// //   { id: 'ba_1CLBUEElCjtiVQnS0U00baPd',
// //      object: 'bank_account',
// //      account_holder_name: 'Edipaulo Zanella',
// //      account_holder_type: 'individual',
// //      bank_name: null,
// //      country: 'BR',
// //      currency: 'brl',
// //      last4: '37-1',
// //      name: 'Edipaulo Zanella',
// //      routing_number: '001-3122-4',
// //      status: 'new' },
// //   client_ip: '179.124.183.34',
// //   created: 1524754458,
// //   livemode: true,
// //   type: 'bank_account',
// //   used: false }
//
// //  { id: 'btok_1C0sjxElCjtiVQnSCwjm0Xdl',
// //   object: 'token',
// //   bank_account:
// //   { id: 'ba_1C0sjxElCjtiVQnSojCu6DHV',
//
// // var stripe = stripePackage(private_key);
// // stripe.tokens.retrieve(
// //   "btok_1C0sjxElCjtiVQnSCwjm0Xdl",
// //   function(err, token) {
// //     console.log(err, token);
// //   }
// // );
