import axios from "axios";
import * as uuid from "uuid";

// enums
enum Domain {
  PROBLEM = "Problem",
  PROCEDURE = "Procedure",
  MEDICATION = "Medication",
}

enum CodeSystem {
  RXNORM = "rxnorm",
  ICD_10_CM = "icd10cm",
  SNOMED_CT = "snomedInternational",
  CPT = "cpt",
  HCPCS = "hcpcs",
}

// types
type ImoPrecisionNormalizeItemType = {
  score: string;
  metadata: {
    mappings: any;
  };
};

type ImoPrecisionNormalizeRequestType = {
  response: { items: ImoPrecisionNormalizeItemType[] };
  record_id: string;
  domain: string;
  input_term: string;
  input_code_system: string;
};

type ImoPrecisionNormalizePayloadType = {
  client_request_id: string;
  preferences: {
    threshold: number;
    match_field_pref: string;
  };
  requests: ImoPrecisionNormalizeRequestType[];
};

async function getImoAuthToken() {
  const url = "https://api-sandbox.imohealth.com/oauth/token";
  const payload = {
    grant_type: "client_credentials",
    client_id: process.env.IMO_CLIENT_ID,
    client_secret: process.env.IMO_CLIENT_SECRET,
    audience: "https://api-sandbox.imohealth.com",
  };

  try {
    const { data, status } = await axios.post(url, payload);

    if (status !== 200) {
      throw new Error("Error getting token");
    }
    return data;
  } catch (error) {
    throw new Error(error);
  }
}

function generateImoPrecisionNormalizePayload(
  domain: string,
  comprehendMedicalEntities: string[]
) {
  const payload = {
    client_request_id: uuid.v4(),
    preferences: {
      threshold: 0.5,
      match_field_pref: "input_term",
    },
    requests: [],
  };

  comprehendMedicalEntities.forEach((entity) => {
    payload.requests.push({
      record_id: uuid.v4(),
      domain: domain,
      input_term: entity,
    });
  });

  return payload;
}

/**
 * Get cleaned codes from precision normalize response
 * filtering by code system
 */
function getCleanedDataByCodeSystem(
  codeSystem: string,
  getImoPrecisionNormalizeResponseData: ImoPrecisionNormalizePayloadType
) {
  const requests = getImoPrecisionNormalizeResponseData.requests;

  if (!requests) return [];
  const cleanedCodes = [];

  requests.forEach((entity: ImoPrecisionNormalizeRequestType) => {
    let codes = [];
    let score = "";

    console.log("PRECISION NORMALIZE REQUEST: ", entity);
    entity.response.items.forEach((item: ImoPrecisionNormalizeItemType) => {
      console.log("IMO PRECISION NORMALIZE ITEM: ", item);
      
      if (!item.metadata?.mappings[codeSystem]) return;
      if (item.metadata.mappings[codeSystem]?.codes.length === 0) return;
      codes = codes.concat(item.metadata.mappings[codeSystem].codes);
      score = item.score;
    });

    if (codes.length === 0) return [];

    cleanedCodes.push({
      record_id: entity.record_id,
      domain: entity.domain,
      input_term: entity.input_term,
      input_term_system: entity.input_code_system,
      codes: codes,
      score: score,
    });
  });

  return cleanedCodes;
}

async function getImoPrecisionNormalize(comprehendMedicalEntities) {
  try {
    const url = "https://api-sandbox.imohealth.com/precision/normalize/v1";
    const { access_token, token_type } = await getImoAuthToken();
    const results = {
      imoRxnorm: {},
      imoIcd10: {},
      imoSnomed: {},
      imoCpt: {},
      imoHcpcs: {},
    };
    const domains: string[] = Object.values(Domain);
    for (const domain of domains) {
      const payload = generateImoPrecisionNormalizePayload(
        domain,
        comprehendMedicalEntities
      );
      const { status, data } = await axios.post(url, payload, {
        headers: {
          Authorization: `${token_type} ${access_token}`,
        },
      });
      if (status !== 200) {
        throw new Error("Error getting Data");
      }
      console.log("PRECISION NORMALIZE DATA: ", data);
      
      switch (domain) {
        case Domain.PROCEDURE:
          results.imoCpt = getCleanedDataByCodeSystem(CodeSystem.CPT, data);
          results.imoSnomed = getCleanedDataByCodeSystem(
            CodeSystem.SNOMED_CT,
            data
          );
          results.imoHcpcs = getCleanedDataByCodeSystem(CodeSystem.HCPCS, data);
          break;
        case Domain.PROBLEM:
          results.imoIcd10 = getCleanedDataByCodeSystem(
            CodeSystem.ICD_10_CM,
            data
          );
          break;
        case Domain.MEDICATION:
          results.imoRxnorm = getCleanedDataByCodeSystem(
            CodeSystem.RXNORM,
            data
          );
          break;
      }
    }

    return results;
  } catch (error) {
    console.log("ERROR GETTING NORMALIZE DATA: ", error);
    throw new Error(error);
  }
}

export { getImoPrecisionNormalize, getImoAuthToken };
