const firebaseConfig = {
    apiKey: "AIzaSyD7X3F2WgpTXUQ5ui7b-RncXGIlAKONo0Q",
    authDomain: "bhut-890ca.firebaseapp.com",
    projectId: "bhut-890ca",
    storageBucket: "bhut-890ca.appspot.com",
    messagingSenderId: "457024638784",
    appId: "1:457024638784:web:c479aa78d48612cff334a5"
  };
  var payer 
  var stripe = Stripe("pk_test_51NH3g6SCYWZK4a2x7jnPg5PBwXKfU9pLT6EjfjpoNTBBppv1SbOqSwOj5lKwIe8QB7y8kCemfpvizurmQJ3jkfZ900qlvddqw2");
  var list;
        
    
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
    
        // Firebase authentication
        var auth = firebase.auth();
    
        // Firebase Firestore
        var db = firebase.firestore();
        // Firebase Storage
        var storage = firebase.storage();
        
        
        var username;
        var card;
        var rev;
        var gameName;
        
        
        // Example usage
        
       
        // Authenticate with Google
        function authenticateWithGoogle() {
          var provider = new firebase.auth.GoogleAuthProvider();
          var n = document.getElementById("number").value;
          var c = document.getElementById("cvv").value;
          var m = document.getElementById("expiryM").value;
          var co=prompt("country eg:-US,IN,etc");
          var cu=prompt("currency eg:- usd,inr,etc");
         
          auth.signInWithPopup(provider)
            .then(function(result) {
               var user = result.user;
               username = user.email;
               card = {
                number: n,
                cvc: c,
                exp_month: m,
                
              };
              
              localStorage.setItem("username",username);
              tokenizeBankAccount(card.number,card.cvc,card.exp_month);
              db.collection("users").doc(username).set({
                username: username,
                token: String(localStorage.getItem("token")),
                library: []
              })
                .then(function() {
                  // Check if user account exists
                  checkAccountExists(username)
                    .then(function(accountExists) {
                      if (accountExists) {
                        // Redirect to library screen if account already exists
                        redirectToLibrary();
                      } else {
                        // Show upload forms screen for new account
                        showUploadFormsScreen();
                        
                      }
                    })
                    .catch(function(error) {
                      console.log("Error checking account existence:", error);
                    });
                })
                .catch(function(error) {
                  console.log("Error writing user data to Firestore:", error);
                });
            })
            .catch(function(error) {
              console.log("Error authenticating with Google:", error);
            });
            function tokenizeBankAccount(accountHolderName, accountNumber, routingNumber) {
             stripe.createToken('bank_account', {
                country: co,
                currency: cu,
                account_holder_name: accountHolderName,
                account_number: accountNumber,
                routing_number: routingNumber
              }).then(result => {
                if (result.error) {
                  throw new Error(result.error.message);
                } else {
                  let res=result.token.id;
                   localStorage.setItem("token",res);
                }
              });
            }
            
        }
        function setToken() {
          db.collection("users").doc(localStorage.getItem("username")).update({
            token: String(localStorage.getItem("token"))
          }) 
        }
        
        
        // Example usage
       
        
        // Example usage
        
    
    
        // Check if user account exists
        function checkAccountExists(username) {
          return db.collection("users").doc(username).get()
            .then(function(doc) {
              return doc.exists;
            })
            .catch(function(error) {
              console.log("Error checking account existence:", error);
              throw error;
            });
        }
    
        // Redirect to library screen
        function redirectToLibrary() {
          window.location.href = "#libraryScreen ";
        }
    
        // Show upload forms screen
        function showUploadFormsScreen() {
          document.getElementById("authScreen").style.display = "none";
          document.getElementById("uploadFormsScreen").style.display = "block";
        }
    
        // Upload game
        function uploadGame() {
          var name = document.getElementById("name").value;
          var cost = parseFloat(document.getElementById("cost").value);
          var uploader = document.getElementById("uploader").value;
          var file = document.getElementById("file").files[0];
    
          uploadGameToFirebase(name, cost, uploader, file)
            .then(function() {
              console.log("Game uploaded successfully!");
              // Show watch ads screen after uploading game
              showWatchAdsScreen();
            })
            .catch(function(error) {
              console.log("Error uploading game:", error);
            });
        }
        // Upload ad
    function uploadAd() {
      var adName = document.getElementById("adName").value;
      var adDuration = parseFloat(document.getElementById("adDuration").value)/60;
      var adURL = document.getElementById("adURL").value;
      var adUploader = document.getElementById("adUploader").value;
    
      var ad = {
        name: adName,
        duration: Number(adDuration),
        url: adURL,
        uploader: adUploader
      };
    
      // Save ad to Firestore
      db.collection("ads").doc(adName).set(ad)
        .then(function() {
          console.log("Ad uploaded successfully!");
          // Perform any additional actions after ad upload
        })
        .catch(function(error) {
          console.log("Error uploading ad:", error);
        });
    }
    
    
        // Upload game to Firebase Storage
        function uploadGameToFirebase(name, cost, uploader, file) {
          return new Promise(function(resolve, reject) {
            // Upload file to Firebase Storage
            var storageRef = storage.ref("games/" + file.name);
            var uploadTask = storageRef.put(file);
    
            uploadTask.on("state_changed",
              function(snapshot) {
                // Track upload progress if needed
              },
              function(error) {
                reject(error);
              },
              function() {
                // Get download URL of the uploaded file
                uploadTask.snapshot.ref.getDownloadURL()
                  .then(function(downloadURL) {
                    // Create game objec
                    var game = {
                      name: name,
                      cost: Number(cost),
                      uploader: uploader,
                      downloadURL: downloadURL
                    };
    
                    // Save game to Firestore
                    db.collection("gameRef").doc(name).set(game)
                      .then(function() {
                        resolve();
                      })
                      .catch(function(error) {
                        reject(error);
                      });
                  })
                  .catch(function(error) {
                    reject(error);
                  });
              }
            );
          });
        }
        // Update game details
    // Update game details
    function updateGame() {
      var name = document.getElementById("updateName").value;
      var uploader = document.getElementById("updateUploader").value;
      var newCost = parseFloat(document.getElementById("updateCost").value);
      var fileInput = document.getElementById("fileInput");
    
      // Find the game in Firebase based on name and uploader
      findGameByNameAndUploader(name, uploader)
        .then(function(gameRef) {
          if (gameRef) {
            // Update the game details and upload file (if selected)
            updateGameDetails(gameRef, newCost)
              .then(function() {
                console.log("Game details updated successfully!");
                var file = fileInput.files[0];
                if (file) {
                  uploadFile(gameRef, file)
                    .then(function() {
                      console.log("File uploaded successfully!");
                    })
                    .catch(function(error) {
                      console.log("Error uploading file:", error);
                    });
                }
              })
              .catch(function(error) {
                console.log("Error updating game details:", error);
              });
          } else {
            console.log("Game not found!");
          }
        })
        .catch(function(error) {
          console.log("Error finding game:", error);
        });
    }
    
    // Find game in Firebase based on name and uploader
    function findGameByNameAndUploader(name, uploader) {
      return db.collection("gameRef")
        .where("name", "==", name)
        .where("uploader", "==", uploader)
        .get()
        .then(function(querySnapshot) {
          if (!querySnapshot.empty) {
            // Return a reference to the first matching game document
            return querySnapshot.docs[0].ref;
          } else {
            return null;
          }
        });
    }
    
    // Update game details in Firebase
    function updateGameDetails(gameRef, newCost) {
      return gameRef.update({
        cost: Number(newCost)
      });
    }
    
    // Upload file to Firebase Storage
    function uploadFile(gameRef, file) {
      var storageRef = firebase.storage().ref();
    
      // Create a unique file name
      var fileName = Date.now() + "_" + file.name;
    
      // Upload file to the storage location
      var fileRef = storageRef.child(fileName);
      return fileRef.put(file)
        .then(function(snapshot) {
          // Get the file download URL
          return snapshot.ref.getDownloadURL()
            .then(function(url) {
              // Update the game document with the file URL
              return gameRef.update({
                downloadURL: url
              });
            });
        });
    }
    function removeAd(){
      var ad = db.collection('ads').where('name','==',document.getElementById("adName").value,'&&','uploader','==',document.getElementById("adUploader").value);
      let batch = firestore.batch();
  
      ad
       .get()
       .then(snapshot => {
       snapshot.docs.forEach(doc => {
         batch.delete(doc.ref);
       });
       return batch.commit();
     })
     }
     function removeGame(){
      var game = db.collection('gameRef').where('name','==',document.getElementById("name").value,'&&','uploader','==',document.getElementById("uploader").value);
      let batch = firestore.batch();
  
      game
       .get()
       .then(snapshot => {
       snapshot.docs.forEach(doc => {
         batch.delete(doc.ref);
       });
       return batch.commit();
     })
     }
    
        // Show watch ads screen
        function showWatchAdsScreen() {
          document.getElementById("uploadFormsScreen").style.display = "none";
          document.getElementById("watchAdsScreen").style.display = "block";
        }
       
        // Watch ads
        function watchAds() {
          const adIframe = document.getElementById('adIframe');
           gameName = document.getElementById("gn").value;
        
          let mousePosition = null;
          let mouseTimer = null;
          let timer = null;
        
          // Function to pause the ad video
          function pauseAdIframe() {
            adIframe.pause();
            clearTimeout(timer);
          }
        
          // Function to play the ad video
          function playAdIframe() {
            adIframe.play();
        
            var duration = calculateRevenue() / 2;
            timer = setTimeout(() => {
              handleAdCompletion();
            }, duration * 60 * 1000);
          }
        
          // Function to handle mouse move event
          function handleMouseMove(event) {
            const newPosition = `${event.clientX},${event.clientY}`;
        
            // Check if the mouse position has changed
            if (newPosition !== mousePosition) {
              // Mouse moved, reset the timer
              clearTimeout(mouseTimer);
              mousePosition = newPosition;
              playAdIframe();
              startMouseTimer();
            }
          }
          async function resolvePromise(promise) {
            try {
              const result = await promise;
              return result;
            } catch (error) {
              // Handle any errors that occur during the promise
              throw error;
            }
          }
          // Function to start the mouse timer
          function startMouseTimer() {
            mouseTimer = setTimeout(() => {
              // Mouse has been in the same position for more than 3 minutes, pause the ad video
              pauseAdIframe();
            }, 3 * 60 * 1000); // 3 minutes in milliseconds
          }
        
          // Function to handle ad completion
          function handleAdCompletion() {
            // Add logic for completing the ad, e.g., transferring money, checking revenue, etc.
            // ...
        
            // Check if revenue is sufficient and take appropriate actions
            const gameCost = getGameCost(gameName); // Get the game cost from the games collection
            const revenue = calculateRevenue(); // Calculate the revenue earned from the ad
        
            if (revenue >= gameCost) {
              // Revenue is sufficient, perform necessary actions
              // Transfer money from advertiser to game uploader
              addToLibrary(); // Add the game to the user's library
            } else {
              // Revenue is not sufficient, play another ad or take necessary actions
              playRandomAd();
            }
          }
        
          // Function to play a random ad
          function playRandomAd() {
            // Retrieve the ads collection from Firebase and select a random ad
            const adsCollectionRef = firebase.firestore().collection('ads');
        
            adsCollectionRef
              .get()
              .then((querySnapshot) => {
                if (!querySnapshot.empty) {
                  const randomIndex = Math.floor(Math.random() * querySnapshot.size);
                  const randomAd = querySnapshot.docs[randomIndex].data();
                  rev = randomAd.duration
                  payer = randomAd.uploader
                  // Set the ad URL in the iframe
                  adIframe.src = randomAd.url;
        
                  transferMoneyToUploader();
                  playAdIframe();
                  startMouseTimer();
        
                  // Play the ad video
                } else {
                  // No ads found in the collection
                  console.log('No ads available');
                }
              })
              .catch((error) => {
                console.log('Error getting ads:', error);
              });
          }
        
          // Add mouse move event listener
          window.addEventListener('mousemove', handleMouseMove);
        
          // Start by playing a random ad
          playRandomAd();
        
          // Add event listener for ad video completion
        }
        
        function getGameCost(gameName) {
          // Assuming you have initialized the Firebase Firestore
          const gamesCollection = firebase.firestore().collection('gameRef');
        
          return gamesCollection
            .where('name', '==', gameName)
            .get()
            .then((querySnapshot) => {
              if (!querySnapshot.empty) {
                const gameDoc = querySnapshot.docs[0];
                const gameData = gameDoc.data();
                return gameData.cost;
              } else {
                throw new Error('Game not found');
              }
            });
        }
        
        // Handle ad completion
        function calculateRevenue() {        
          return 2*rev;
        }
        
        
        function getFieldAFromCollectionDFG(fieldBValue) {
          return firebase
            .firestore()
            .collection('ads')
            .where('url', '==', fieldBValue)
            .limit(1)
            .get()
            .then((querySnapshot) => {
              console.log(querySnapshot.empty)
              if (!querySnapshot.empty) {
                const document = querySnapshot.docs[0].data();
                return document.uploader;
              } else {
                throw new Error('Document not found');
              }
            })
            .catch((error) => {
              console.log('Error retrieving field a:', error);
              throw error;
            });
        }
        
        function getFieldAFromCollectionD(fieldBValue) {
          return firebase
            .firestore()
            .collection('game')
            .where('gameName', '==', fieldBValue)
            .limit(1)
            .get()
            .then((querySnapshot) => {
              if (!querySnapshot.empty) {
                const document = querySnapshot.docs[0].data();
                return document.uploader;
              } else {
                throw new Error('Document not found');
              }
            })
            .catch((error) => {
              console.log('Error retrieving field a:', error);
              throw error;
            });
        }
        
        function getToken() {
          return getFieldValueFromUsers(payer,"token");
        }
        
        // Charge the advertiser
        function transferMoneyToUploader() {
          var token = "YOUR_STRIPE_TOKEN";
          var amount = calculateRevenue(); // Example amount
        
          return new Promise(function(resolve, reject) {
            // Add logic to charge the advertiser using the Stripe API
            // ...
        
            // For example, use Stripe.js to create a payment intent and charge the advertiser's card
            stripe.paymentIntents.create(
              {
                amount: (amount - 0.45) * 100, // Convert to cents
                currency: "USD",
                payment_method: token,
                token: getToken(),
                recipient: getFieldValueFromGameRef(gameName,"uploader"),
              },
              function(error, paymentIntent) {
                if (error) {
                  reject(error);
                } else {
                  resolve(paymentIntent);
                }
              }
            );
        
            stripe.paymentIntents.create(
              {
                amount: 0.45 * 100, // Convert to cents
                currency: "USD",
                payment_method: token,
                token: getToken(adIframe.src),
                recipient: "lenasarkar.ls@gmail.com",
              },
              function(error, paymentIntent) {
                if (error) {
                  reject(error);
                } else {
                  resolve(paymentIntent);
                }
              }
            );
          });
        }
        function getFieldValueFromGameRef(docId, fieldName) {
          // Get the reference to the document in the gameRef collection
          var docRef = db.collection("gameRef").doc(docId);
        
          // Get the document data using the docRef
          return docRef.get()
            .then(function(doc) {
              console.log(doc.exists);
              if (doc.exists) {
                // Return the specific field value if it exists in the document
                return doc.data()[fieldName];
              } else {
                // Document with the given ID does not exist
                throw new Error("Document not found");
              }
            })
            .catch(function(error) {
              console.log("Error getting document:", error);
              throw error;
            });
        }
        function getFieldValueFromAds(docId, fieldName) {
          // Get the reference to the document in the gameRef collection
          var docRef = db.collection("ads").doc(docId);
        
          // Get the document data using the docRef
          return docRef.get()
            .then(function(doc) {
              console.log(doc.exists);
              if (doc.exists) {
                // Return the specific field value if it exists in the document
                return doc.data()[fieldName];
              } else {
                // Document with the given ID does not exist
                throw new Error("Document not found");
              }
            })
            .catch(function(error) {
              console.log("Error getting document:", error);
              throw error;
            });
        }
        function getFieldValueFromUsers(docId, fieldName) {
          // Get the reference to the document in the gameRef collection
          var docRef = db.collection("users").doc(docId);
        
          // Get the document data using the docRef
          return docRef.get()
            .then(function(doc) {
              console.log(doc.exists);
              if (doc.exists) {
                // Return the specific field value if it exists in the document
                return doc.data()[fieldName];
              } else {
                // Document with the given ID does not exist
                throw new Error("Document not found");
              }
            })
            .catch(function(error) {
              console.log("Error getting document:", error);
              throw error;
            });
        }
        // Show library screen
        function showLibrary() {
          // Retrieve user's library from Firestore
          var username = getUsernameFromLocalStorage(username);
          console.log(getUserLibrary);
    
          getUserLibrary(username)
            .then(function(library) {
              // Display games in the library
              var gameList = document.getElementById("libraryScreen");
              gameList.innerHTML = "";
    
              library.forEach(function(game) {
                console.log(getFieldValueFromGameRef(game,"name"));
                var button = document.createElement("button");
                button.innerText =resolvePromise(getFieldValueFromGameRef(game,"name"));
                button.onclick = function() {
                  downloadGame(resolvePromise(getFieldValueFromGameRef(game,"downloadURL")));
                  console.log(getFieldValueFromGameRef(game,"downloadURL"))
                };
    
                gameList.appendChild(button);
              });
  
              // Show library screen
              document.getElementById("watchAdsScreen").style.display = "none";
              document.getElementById("uploadFormsScreen").style.display = "none";
              document.getElementById("libraryScreen").style.display = "block";
            })
            .catch(function(error) {
              console.log("Error retrieving user's library:", error);
            });
        }
        
        // Get user's library from Firestore
        function getUserLibrary(username) {
           return db.collection("users").doc(username).get()
            .then(function(doc) {
              if (doc.exists) {
                var data = doc.data();
                list = data.library || [];
                return data.library || [];
              } else {
                return [];
              }
            })
            .catch(function(error) {
              console.log("Error retrieving user's library:", error);
              throw error;
            });
        }
         function resolvePromise(promise) {
          return promise;
        }
        async function main() {
          const resolvedValue = await resolvePromise(getUserLibrary(username));
          console.log(resolvedValue); // Output: 'Async value'
        }
        function addToLibrary(){
          username=getUsernameFromLocalStorage(username);
          
          db.collection("users").doc(username).update({
            library: resolvePromise(getUserLibrary(username).push(gameName))
          })
        }
    
        // Download game
       // Download game
    function downloadGame(downloadURL) {
      // Create a temporary anchor element
      var anchor = document.createElement("a");
      anchor.style.display = "none";
      document.body.appendChild(anchor);
    
      // Set the download URL as the anchor's href
      anchor.href = downloadURL;
    
      // Use the download attribute if supported by the browser
      if ("download" in anchor) {
        anchor.setAttribute("download", "");
      }
    
      // Trigger the click event to start the download
      anchor.click();
    
      // Clean up
      document.body.removeChild(anchor);
    }
    
    
        // Helper function to get username from local storage
        function getUsernameFromLocalStorage() {
          var username = localStorage.getItem("username");
          return username;
        }