/**
 * Caclculate each disese probability
 * @param {Array} major_answers - Array with major questions answers
 * @param {Array} min_major_true - Array with minor questions answers
 * @return {Object} - Json with diseases probabilities
 */

import * as diagnosisData from "../../assets/diagnosis_data/diagnosis_data.json";

function compareWithAnswers(
  questions,
  comparisonSign,
  comparisonValue,
  allAnswers
) {
  let sumOfTrueAnswers = 0;
  questions.forEach((questionNr) => {
    if (allAnswers[Number(questionNr) - 1] === 1) {
      sumOfTrueAnswers += 1;
    }
  });

  switch (comparisonSign) {
    case "==":
      return sumOfTrueAnswers === comparisonValue;
    case ">":
      return sumOfTrueAnswers > comparisonValue;
    case ">=":
      return sumOfTrueAnswers >= comparisonValue;
    case "<":
      return sumOfTrueAnswers < comparisonValue;
    case "<=":
      return sumOfTrueAnswers <= comparisonValue;
    default:
      throw Error(`Wrong diagnosis data comparison sign: ${comparisonSign}`);
  }
}

function getCondValue(condition, allAnswers) {
  const condElements = condition.split(" ");

  const method = condElements[0].slice(0, 3);
  const questions = condElements[0].slice(4, -1).split(",");
  const comparisonSign = condElements[1];
  const comparisonValue = Number(condElements[2]);

  switch (method) {
    case "PYT":
      return compareWithAnswers(
        questions,
        comparisonSign,
        comparisonValue,
        allAnswers
      );
    default:
      return false;
  }
}

function goOnSideConds(allAnswers, diagnosisConditions) {
  let goOn = true;
  Object.keys(diagnosisConditions).forEach((cond) => {
    if (cond.slice(0, 4) === "main") {
      goOn = goOn && getCondValue(diagnosisConditions[cond], allAnswers);
    }
  });
  return goOn;
}

function calculateSingleDiseaseSideProbability(
  allAnswers,
  diagnosisConditions
) {
  let sideCondsNumbers = 0;
  let trueSideCondsNumbers = 0;
  Object.keys(diagnosisConditions).forEach((cond) => {
    if (
      (cond.slice(0, 4) === "side" || cond.slice(0, 6) === "detail") &&
      diagnosisConditions[cond] !== "null"
    ) {
      sideCondsNumbers += 1;
      if (getCondValue(diagnosisConditions[cond], allAnswers)) {
        trueSideCondsNumbers += 1;
      }
    }
  });
  return Number((trueSideCondsNumbers / sideCondsNumbers).toFixed(2));
}

function getThisModuleData(thisModuleCode) {
  let thisModuleData;
  diagnosisData.default.forEach((module) => {
    if (module.module_code === thisModuleCode) {
      thisModuleData = module;
    }
  });
  return thisModuleData;
}

function conditionsAccomplishment(allAnswers, diseaseConditions) {
  const conditionsAcc = {};

  conditionsAcc.main = {};
  conditionsAcc.side = {};
  conditionsAcc.detail = {};

  conditionsAcc.main.validAnswers = 0;
  conditionsAcc.main.allAnswers = 0;
  conditionsAcc.side.validAnswers = 0;
  conditionsAcc.side.allAnswers = 0;
  conditionsAcc.detail.validAnswers = 0;
  conditionsAcc.detail.allAnswers = 0;

  Object.keys(diseaseConditions).forEach((cond) => {
    if (diseaseConditions[cond] !== "null") {
      const answer = getCondValue(diseaseConditions[cond], allAnswers);
      switch (cond.slice(0, 4)) {
        case "main":
          conditionsAcc.main.validAnswers += answer;
          conditionsAcc.main.allAnswers += 1;
          break;
        case "side":
          conditionsAcc.side.validAnswers += answer;
          conditionsAcc.side.allAnswers += 1;
          break;
        case "deta":
          conditionsAcc.detail.validAnswers += answer;
          conditionsAcc.detail.allAnswers += 1;
          break;
        default:
          break;
      }
    }
  });
  return conditionsAcc;
}

function calculateSingleDiseaseProbability(allAnswers, singleDiagnosisData) {
  const newRecord = {};
  newRecord.disease_icd10 = singleDiagnosisData.disease_icd10;
  newRecord.disease_name = singleDiagnosisData.disease_name;
  const { diagnosisConditions } = singleDiagnosisData.diagnosis_conditions;
  newRecord.conditionsAcc = conditionsAccomplishment(
    allAnswers,
    singleDiagnosisData
  );

  if (goOnSideConds(allAnswers, diagnosisConditions)) {
    newRecord.probability = calculateSingleDiseaseSideProbability(
      allAnswers,
      diagnosisConditions
    );
  } else {
    newRecord.probability = 0;
  }
  return newRecord;
}

export default function calculateDiseasesProbability(
  majorAnswers,
  minorAnswers,
  moduleCode
) {
  const allAnswers = majorAnswers.concat(minorAnswers);
  const probabilityData = [];

  getThisModuleData(moduleCode).module_data.forEach((disease) => {
    const diseaseProbability = calculateSingleDiseaseProbability(
      allAnswers,
      disease
    );
    probabilityData.push(diseaseProbability);
  });

  return probabilityData;
}
