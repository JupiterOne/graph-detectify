import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationRelationship,
} from '@jupiterone/integration-sdk-core';

import { getAccountEntity, getServiceEntity } from '../../converter';
import { Entities } from '../../constants';

const step: IntegrationStep = {
  id: 'fetch-account',
  name: 'Fetch Detectify account and service',
  types: [Entities.ACCOUNT._type, Entities.SERVICE._type],
  async executionHandler({
    instance,
    jobState,
  }: IntegrationStepExecutionContext) {
    const accountEntity = getAccountEntity(instance);
    await jobState.addEntity(accountEntity);

    const serviceEntity = getServiceEntity(instance);
    await jobState.addEntity(serviceEntity);

    const accountServiceRelationship = createIntegrationRelationship({
      from: accountEntity,
      to: serviceEntity,
      _class: 'PROVIDES',
    });
    await jobState.addRelationship(accountServiceRelationship);
  },
};

export default step;
