import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Blob "mo:base/Blob";
import Time "mo:base/Time";
import Order "mo:base/Order";
actor Miyu{
  type User = {
    id : Principal;
    username : Text;
    email : Text;
    location : Text;
    description : Text;
    interests : [Text];
    photos : [Blob];
    connections : ?Principal;
    connectionReqs : [Principal];
    reqTo : [Principal];
    history : [Principal];
  };
  
  stable var users : [User] = [];

  type Message = {
    from: Principal;
    to: Principal;
    timestamp: Time.Time;
    content: Text;
  };

  stable var chats : [Message] = [];

  public query(msg) func getMe() : async (Text, User) { //kembaliin data + update data if need
    if(not checkUserExist(msg.caller)){
      let user : User = {
        id = msg.caller;
        username = "";
        email = "";
        location = "";
        description = "";
        interests = [];
        photos = [];
        connections = null;
        connectionReqs = [];
        reqTo = [];
        history = [];
      };
      return ("User not found!", user);
    };
    let findUser : User = switch (Array.find<User>(users, func (user: User) : Bool { user.id == msg.caller })) {
      case (null) {
        let user : User = {
          id = msg.caller;
          username = "";
          email = "";
          location = "";
          description = "";
          interests = [];
          photos = [];
          connections = null;
          connectionReqs = [];
          reqTo = [];
          history = [];
        };
        return ("User not found!", user);
      };
      case (?user) {
       user;
      };
    };
    return ("Success Getting User ", findUser);
  };
  public query(msg) func getCaller () : async Principal {
    return msg.caller;
  };
  
  func checkUserExist(userId : Principal) : Bool {  // cek userId udah ada di users
    let existingUser = Array.find<User>(users, func (user: User) : Bool { user.id == userId });
    return existingUser != null;
  };
  public shared(msg) func createAccount(username : Text, email : Text, location : Text) : async Text {
    let userId: Principal = msg.caller;

    if(checkUserExist(userId)){
      return "User with this ID already exists!";
    };

    let newUser: User = {
      id = userId;         // Principal ID pemanggil
      username = username; // Nama pengguna
      email = email;       // Email pengguna
      location = location; // Lokasi pengguna
      description = "";     // Deskripsi awal kosong
      photos = [];         // Kosongkan dulu
      interests = [];      // Tidak ada minat awal
      connections = null;    // Tidak ada koneksi awal
      connectionReqs = []; // Tidak ada koneksi awal
      reqTo = [];
      history = [];
    };

    users := Array.append(users, [newUser]);

    return "Account created successfully! with ID: " # Principal.toText(userId);    
  };

  public shared(msg) func login() : async Text {
    let userId: Principal = msg.caller;
    if(checkUserExist(userId)){
      return "Login Success!";
    } else {
      return "User not found!";
    };
  };

  public shared(msg) func updateProfile(username: ?Text, email: ?Text, location: ?Text, description: ?Text) : async Text {
    let userId: Principal = msg.caller;
    if(not checkUserExist(userId)){
      return "User not found!";
    };
    let currentUser = Array.find<User>(users, func(user: User): Bool {
      user.id == userId;
    });
    switch (currentUser) {
      case (null) {
        return "User not found!";
      };
      case (?user) {
        users := Array.map<User, User>(users, func(user: User) : User {
          if (user.id == userId) {
            return {
              id = user.id;
              username = switch (username) {
                case (null) { user.username };
                case (?newUsername) { newUsername };
              };
              location = switch (location) {
                case (null) { user.location };
                case (?newLocation) { newLocation };
              };
              description = switch (description) {
                case (null) { user.description };
                case (?newDescription) { newDescription };
              };
              interests = user.interests;
              email = switch (email) {
                case (null) { user.email };
                case (?newEmail) { newEmail };
              };
              photos = user.photos;
              connections = user.connections;
              connectionReqs = user.connectionReqs;
              reqTo = user.reqTo;
              history = user.history;
            };
          } else {
            return user;
          };
        });
        return "Profile updated successfully!";
      };
    };
  };

  // Untuk Testing
  public shared func createAccountWithId(userId : Principal, username : Text, email : Text, location : Text) : async Text {
    if(checkUserExist(userId)){
      return "User with this ID already exists!";
    };

    let newUser: User = {
      id = userId;         // Principal ID pemanggil
      username = username; // Nama pengguna
      email = email;       // Email pengguna
      location = location; // Lokasi pengguna
      description = "";     // Deskripsi awal kosong
      photos = [];         // Kosongkan dulu
      interests = [];      // Tidak ada minat awal
      connections = null;    // Tidak ada koneksi awal
      connectionReqs = []; // Tidak ada koneksi awal
      reqTo = [];
      history = [];
    };

    users := Array.append(users, [newUser]);

    return "Account created successfully! with ID: " # Principal.toText(userId);    
  };
  public query func getAllUsers() : async [User] {
    return users;
  };

  func checkConnection(userId : Principal) : Bool {
    if (checkUserExist(userId)) {
      let checkUser = Array.find<User>(users, func (user: User) : Bool { user.id == userId });
      switch (checkUser) {
        case (null) {
          return false;
        };
        case (?user) {
          return user.connections != null; //check connection
        };
      };
    };
    return false;
  };


  public shared(msg) func sendConnReq(to : Principal) : async Text  {
    let from = msg.caller;
    if(not checkUserExist(from)){
      return "Error, user is not exist";
    };
    if (from == to) {
        return "Error, you cannot send a connection request to yourself!";
    };
    if (not checkUserExist(to)) {
        return "Error, user is not exist";
    };
    if (checkConnection(to)) {
        return "Error, user already connected";
    };
    if (checkConnection(from)) {
        return "Error, you already connected";
    };
    users := Array.map<User, User>(users, func (user: User) : User {
      if (user.id == to) {
        return {
          id = user.id;
          username = user.username;
          location = user.location;
          description = user.description;
          interests = user.interests;
          email = user.email;
          photos = user.photos;
          connections = user.connections;
          connectionReqs = Array.append(user.connectionReqs, [from]);
          reqTo = user.reqTo;
          history = user.history;
        };
      } else if (user.id == from) {
        return {
          id = user.id;
          username = user.username;
          location = user.location;
          description = user.description;
          interests = user.interests;
          email = user.email;
          photos = user.photos;
          connections = user.connections;
          connectionReqs = user.connectionReqs;
          reqTo = Array.append(user.reqTo, [to]);
          history = user.history;
        };
      } else {
        return user;
      };
    });

    return "Succeed!!! request sent to " # Principal.toText(to);
  };

  public shared(msg) func accConnReq(from : Principal) : async Text {
    let to = msg.caller;
    if(not checkUserExist(from)){
      return "Error, user is not exist";
    };
    if (from == to) {
        return "Error, you cannot accept a connection request from yourself!";
    };

    let toUser = Array.find<User>(users, func(user: User): Bool {
      user.id == to;
    });

    let fromCheck = switch (toUser) {
      case (null) { null };
      case (?user) {
        Array.find<Principal>(user.connectionReqs, func(req: Principal): Bool {
          req == from;
        })
      };
    };
    if (fromCheck == null) {
      return "Error, no connection request found from " # Principal.toText(from) # " to " # Principal.toText(to);
    };

    
    users := Array.map<User, User>(users, func(user: User) : User {
      if (user.id == to) {
        return {
          id = user.id;
          username = user.username;
          location = user.location;
          description = user.description;
          interests = user.interests;
          email = user.email;
          photos = user.photos;
          connections = ?from;
          connectionReqs = [];
          reqTo = [];
          history = user.history;
        };
      } else if (user.id == from) {
        return {
          id = user.id;
          username = user.username;
          location = user.location;
          description = user.description;
          interests = user.interests;
          email = user.email;
          photos = user.photos;
          connections = ?to;
          connectionReqs = [];
          reqTo = [];
          history = user.history;
        };
      } else {
        return user;
      };
    });

    return "Connection request accepted between " # Principal.toText(to) # " and " # Principal.toText(from) ;
  };


  public shared(msg) func deleteConnReq(from : Principal): async Text {
    let to = msg.caller;
    if(not checkUserExist(to)){
      return "Error, user is not exist";
    };
    if(not checkUserExist(from)){
      return "Error, user is not exist";
    };
    let toUser = Array.find<User>(users, func(user: User): Bool {
      user.id == to;
    });
    let fromCheck = switch (toUser) {
      case (null) { null };
      case (?user) {
        Array.find<Principal>(user.connectionReqs, func(req: Principal): Bool {
          req == from;
        })
      };
    };
    if (fromCheck == null) {
      return "Error, no connection request found from " # Principal.toText(from) # " to " # Principal.toText(to);
    };

    users := Array.map<User, User>(users, func(user: User) : User {
      if (user.id == to) {
        return {
          id = user.id;
          username = user.username;
          location = user.location;
          description = user.description;
          interests = user.interests;
          email = user.email;
          photos = user.photos;
          connections = user.connections;
          connectionReqs = Array.filter<Principal>(user.connectionReqs, func(req: Principal): Bool {
                    req != from;
                });
          reqTo = user.reqTo;
          history = user.history;
        };
      } else if (user.id == from) {
        return {
          id = user.id;
          username = user.username;
          location = user.location;
          description = user.description;
          interests = user.interests;
          email = user.email;
          photos = user.photos;
          connections = user.connections;
          connectionReqs = user.connectionReqs;
          reqTo = [];
          history = user.history;
        };
      } 
      else {
        return user;
      }
    });

    return "Remove the request from " # Principal.toText(from) ;
  };

  public query(msg) func viewOtherReq() : async [Principal] {
    let userId = msg.caller;
    if(not checkUserExist(userId)){
      return [];
    };
    let currentUser = Array.find<User>(users, func(user: User): Bool {
      user.id == userId;
    }); 
    switch (currentUser) {
        case (null) {
            return []; 
        };
        case (?user) {
            return user.connectionReqs;
        };
    };
  };
  // public func addImage()
  // Image Function
  public shared(msg) func addImage(image : Blob) : async Text {
    let userId = msg.caller;
    if(not checkUserExist(userId)){
      return "User not found!";
    };
    let currentUser = Array.find<User>(users, func(user: User): Bool {
      user.id == userId;
    });
    switch (currentUser) {
      case (null) {
        return "User not found!";
      };
      case (?user) {
        users := Array.map<User, User>(users, func(user: User) : User {
          if (user.id == userId) {
            return {
              id = user.id;
              username = user.username;
              location = user.location;
              description = user.description;
              interests = user.interests;
              email = user.email;
              photos = Array.append(user.photos, [image]);
              connections = user.connections;
              connectionReqs = user.connectionReqs;
              reqTo = user.reqTo;
              history = user.history;
            };
          } else {
            return user;
          };
        });
        return "Image added successfully!";
      };
    };
  };
  public shared(msg) func changeImage (prevImage : Blob, newImage : Blob) : async Text {
    let userId = msg.caller;
    if(not checkUserExist(userId)){
      return "User not found!";
    };
    let currentUser = Array.find<User>(users, func(user: User): Bool {
      user.id == userId;
    });
    switch (currentUser) {
      case (null) {
        return "User not found!";
      };
      case (?user) {
        users := Array.map<User, User>(users, func(user: User) : User {
          if (user.id == userId) {
            return {
              id = user.id;
              username = user.username;
              location = user.location;
              description = user.description;
              interests = user.interests;
              email = user.email;
              photos = Array.map<Blob, Blob>(user.photos, func(photo: Blob) : Blob {
                if (photo == prevImage) {
                  return newImage;
                } else {
                  return photo;
                };
              });
              connections = user.connections;
              connectionReqs = user.connectionReqs;
              reqTo = user.reqTo;
              history = user.history;
            };
          } else {
            return user;
          };
        });
        return "Image changed successfully!";
      };
    };
  };
  public shared(msg) func deleteImage(image : Blob) : async Text {
    let userId = msg.caller;
    if(not checkUserExist(userId)){
      return "User not found!";
    };
    let currentUser = Array.find<User>(users, func(user: User): Bool {
      user.id == userId;
    });
    switch (currentUser) {
      case (null) {
        return "User not found!";
      };
      case (?user) {
        users := Array.map<User, User>(users, func(user: User) : User {
          if (user.id == userId) {
            return {
              id = user.id;
              username = user.username;
              location = user.location;
              description = user.description;
              interests = user.interests;
              email = user.email;
              photos = Array.filter<Blob>(user.photos, func(photo: Blob): Bool {
                photo != image;
              });
              connections = user.connections;
              connectionReqs = user.connectionReqs;
              reqTo = user.reqTo;
              history = user.history;
            };
          } else {
            return user;
          };
        });
        return "Image deleted successfully!";
      };
    };
  };

  public query(msg) func getInterests() : async [Text] {
    let userId = msg.caller;
    let currentUser = Array.find<User>(users, func(user: User): Bool {
      user.id == userId;
    });
    switch (currentUser) {
      case (null) {
        return [];
      };
      case (?user) {
        return user.interests;
      };
    };
  };

  public shared(msg) func updateInterests(interests : [Text]) : async Text {
    let userId = msg.caller;
    if(not checkUserExist(userId)){
      return "User not found!";
    };
    let currentUser = Array.find<User>(users, func(user: User): Bool {
      user.id == userId;
    });
    switch (currentUser) {
      case (null) {
        return "User not found!";
      };
      case (?user) {
        users := Array.map<User, User>(users, func(user: User) : User {
          if (user.id == userId) {
            return {
              id = user.id;
              username = user.username;
              location = user.location;
              description = user.description;
              interests = interests;
              email = user.email;
              photos = user.photos;
              connections = user.connections;
              connectionReqs = user.connectionReqs;
              reqTo = user.reqTo;
              history = user.history;
            };
          } else {
            return user;
          };
        });
        return "Interests updated successfully!";
      };
    };
  };

  public shared(msg) func getAllUsersWithSameInterest(interest: Text): async [User] {
    if(not checkUserExist(msg.caller)){
      return [];
    };
      var usersWithSameInterest = Array.filter<User>(users, func(user: User): Bool {
          // Periksa apakah `interest` ada di `user.interests`
          return contains(user.interests, interest);
      });
      usersWithSameInterest := Array.filter<User>(usersWithSameInterest, func(user: User): Bool {
          return user.id != msg.caller;
      });
      // usersWithSameInterest
      return usersWithSameInterest;
  };

  // Fungsi helper untuk memeriksa apakah array mengandung elemen tertentu
  func contains(arr: [Text], target: Text): Bool {
      return Array.find<Text>(arr, func(item: Text): Bool {
          item == target
      }) != null;
  };

  public query(msg) func getAllUsersWithSameLocation(location: Text): async [User] {
      if(not checkUserExist(msg.caller)){
        return [];
      };
      var usersWithSameLocation = Array.filter<User>(users, func(user: User): Bool {
          return user.location == location;
      });
      usersWithSameLocation := Array.filter<User>(usersWithSameLocation, func(user: User): Bool {
          return user.id != msg.caller;
      });
      return usersWithSameLocation;
  };

  public shared(msg) func sendMessage(to: Principal, content: Text): async Text {
    if(not checkUserExist(msg.caller)){
      return "Error, user is not exist";
    };
    let from = msg.caller;
    let timestamp = Time.now();
    let newMessage: Message = {
      from = from;
      to = to;
      timestamp = timestamp;
      content = content;
    };
    chats := Array.append(chats, [newMessage]);
    return newMessage.content;
  };

  public query(msg) func getChats(): async [Message] {
    let userId = msg.caller;
    if(not checkUserExist(userId)){
      return [];
    };
    let userChats = Array.filter<Message>(chats, func(chat: Message): Bool {
      return chat.from == userId or chat.to == userId;
    });
    return userChats;
  };

  public query(msg) func viewMyReq() : async [Principal] {
    let userId = msg.caller;
    if(not checkUserExist(userId)){
      return [];
    };
    let currentUser = Array.find<User>(users, func(user: User): Bool {
      user.id == userId;
    });
    switch (currentUser) {
      case (null) {
        return [];
      };
      case (?user) {
        return user.reqTo;
      };
    };
  };

  public shared(msg) func deleteNowConnection(userb : Principal): async Text {
    let usera = msg.caller;
    
    let useraUser = Array.find<User>(users, func(user: User): Bool { user.id == usera });
    let userbUser = Array.find<User>(users, func(user: User): Bool { user.id == userb });

    if (useraUser == null or userbUser == null) {
        return "Error, one or both users do not exist.";
    };

    users := Array.map<User, User>(users, func(user: User): User {
      
        if (user.id == usera) {
            return {
                id = user.id;
                username = user.username;
                location = user.location;
                description = user.description;
                interests = user.interests;
                email = user.email;
                photos = user.photos;
                connections = null;
                connectionReqs = [];
                reqTo = [];
                history = Array.append(user.history, [userb]);
            };
        } else if (user.id == userb) {
            return {
                id = user.id;
                username = user.username;
                location = user.location;
                description = user.description;
                interests = user.interests;
                email = user.email;
                photos = user.photos;
                connections = null;
                connectionReqs = [];
                reqTo = [];
                history = Array.append(user.history, [usera]);
            };
        } 
        else {
            return user;
        }
    });

    return "Removed connection between " # Principal.toText(usera) # " and " # Principal.toText(userb) ;
};

  public query(msg) func getChatWithUser(userId: Principal): async [Message] {
    if(not checkUserExist(userId) or not checkUserExist(msg.caller)){
      return [];
    };
    var userChats = Array.filter<Message>(chats, func(chat: Message): Bool {
      return (chat.from == msg.caller and chat.to == userId) or (chat.from == userId and chat.to == msg.caller);
    });

    return Array.sort<Message>(userChats, func(a: Message, b: Message): Order.Order {
      if (a.timestamp == b.timestamp) {
        return #equal;
      } else if (a.timestamp > b.timestamp) {
        return #greater;
      } else {
        return #less;
      }
    });
    return userChats;
  };

  public shared(msg) func deleteChatWithUser(userId: Principal): async Text {
    if(not checkUserExist(userId) or not checkUserExist(msg.caller)){
      return "Error, user is not exist";
    };
    chats := Array.filter<Message>(chats, func(chat: Message): Bool {
      return not ((chat.from == msg.caller and chat.to == userId) or (chat.from == userId and chat.to == msg.caller));
    });
    return "Chat with user " # Principal.toText(userId) # " deleted successfully!";
  };

};