module.exports = {
    transform: {
      "^.+\\.(js|jsx)$": "babel-jest",
    },
    verbose: true,
    transformIgnorePatterns: [
      "node_modules/(?!react-native|native-base|react-clone-referenced-element)"
    ]
  };
