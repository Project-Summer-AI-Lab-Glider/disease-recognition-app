import React from "react";
import { StyleSheet, Text } from "react-native";
import PropTypes from "prop-types";
import { Colors, Typography } from "../../constants/styles";

const FormErrorMessage = ({ error, visible }) => {
  const isVisibleAndHasError = error && visible;

  return isVisibleAndHasError ? (
    <Text style={styles.errorText}>{error}</Text>
  ) : null;
};

const styles = StyleSheet.create({
  errorText: {
    marginLeft: 15,
    color: Colors.BLACK,
    fontSize: Typography.FONT_SIZE_16,
    marginBottom: 5,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
  },
});

FormErrorMessage.defaultProps = {
  error: "",
  visible: false,
};

FormErrorMessage.propTypes = {
  error: PropTypes.string,
  visible: PropTypes.bool,
};

export default FormErrorMessage;
