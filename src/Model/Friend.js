import React from "react";

class Friend {
  constructor(email, firstName, lastName, schoolId, role, username = "") {
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.schoolId = schoolId;
    this.role = role;
    this.username = username;
  }
}

export default Friend;
