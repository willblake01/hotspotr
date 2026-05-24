'use strict';

const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
      'User',
      {
        localemail: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true
          }
        },
        localpassword: {
          type: DataTypes.STRING,
          allowNull: false
        }
      },
      {
        // getterMethods and setterMethods belong here at the model options
        // level, not nested inside classMethods (which was removed in Sequelize v4)
        getterMethods: {
          someValue() {
            return this.getDataValue('someValue');
          }
        },
        setterMethods: {
          someValue(value) {
            this.setDataValue('someValue', value);
          }
        }
      }
  );

  // Instance methods are added directly on the prototype in Sequelize v4+.
  // classMethods no longer exists.

  // Hashes a plaintext password — call before saving a new user.
  User.prototype.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
  };

  // Compares a plaintext candidate against this user's stored hash.
  // Must be a regular function (not arrow) so `this` refers to the instance.
  User.prototype.validPassword = function (password) {
    return bcrypt.compareSync(password, this.localpassword);
  };

  return User;
};