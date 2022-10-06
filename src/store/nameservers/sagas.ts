import {all, call, put, select, takeLatest} from 'redux-saga/effects';
import {ApiError, ApiResponse, CreateResponse, DeleteResponse} from '../../services/api-client/types';
import {NameServerGroup} from './types'
import service from './service';
import actions from './actions';

export function* getNameServerGroup(action: ReturnType<typeof actions.getNameServerGroup.request>): Generator {
  try {

    yield put(actions.setDeletedNameServerGroup({
      loading: false,
      success: false,
      failure: false,
      error: null,
      data: null
    } as DeleteResponse<string | null>))

    const effect = yield call(service.getNameServerGroup, action.payload);
    const response = effect as ApiResponse<NameServerGroup[]>;

    yield put(actions.getNameServerGroup.success(response.body));
  } catch (err) {
    yield put(actions.getNameServerGroup.failure(err as ApiError));
  }
}

export function* setCreatedNameServerGroup(action: ReturnType<typeof  actions.setSavedNameServerGroup>): Generator {
  yield put(actions.setSavedNameServerGroup(action.payload))
}

export function* saveNameServerGroup(action: ReturnType<typeof actions.saveNameServerGroup.request>): Generator {
  try {
    yield put(actions.setSavedNameServerGroup({
      loading: true,
      success: false,
      failure: false,
      error: null,
      data: null
    } as CreateResponse<NameServerGroup | null>))

    const nameserverGroupToSave = action.payload.payload

    const payloadToSave = {
      getAccessTokenSilently: action.payload.getAccessTokenSilently,
      payload: {
        id: nameserverGroupToSave.id,
        name: nameserverGroupToSave.name,
        description: nameserverGroupToSave.description,
        nameservers: nameserverGroupToSave.nameservers
      } as NameServerGroup
    }

    let effect
    if (!nameserverGroupToSave.id) {
       effect = yield call(service.createNameServerGroup, payloadToSave);
    } else {
      payloadToSave.payload.id = nameserverGroupToSave.id
      effect = yield call(service.editNameServerGroup, payloadToSave);
    }

    const response = effect as ApiResponse<NameServerGroup>;

    yield put(actions.saveNameServerGroup.success({
      loading: false,
      success: true,
      failure: false,
      error: null,
      data: response.body
    } as CreateResponse<NameServerGroup | null>));

    yield put(actions.getNameServerGroup.request({ getAccessTokenSilently: action.payload.getAccessTokenSilently, payload: null }));
  } catch (err) {
    yield put(actions.saveNameServerGroup.failure({
      loading: false,
      success: false,
      failure: true,
      error: err as ApiError,
      data: null
    } as CreateResponse<NameServerGroup | null>));
  }
}

export function* setDeleteNameServerGroup(action: ReturnType<typeof  actions.setDeletedNameServerGroup>): Generator {
  yield put(actions.setDeletedNameServerGroup(action.payload))
}

export function* deleteNameServerGroup(action: ReturnType<typeof actions.deleteNameServerGroup.request>): Generator {
  try {
    yield call(actions.setDeletedNameServerGroup,{
      loading: true,
      success: false,
      failure: false,
      error: null,
      data: null
    } as DeleteResponse<string | null>)

    const effect = yield call(service.deletedNameServerGroup, action.payload);
    const response = effect as ApiResponse<any>;

    yield put(actions.deleteNameServerGroup.success({
      loading: false,
      success: true,
      failure: false,
      error: null,
      data: response.body
    } as DeleteResponse<string | null>));

    const nameserverGroup = (yield select(state => state.nameserverGroup.data)) as NameServerGroup[]
    yield put(actions.getNameServerGroup.success(nameserverGroup.filter((p:NameServerGroup) => p.id !== action.payload.payload)))
  } catch (err) {
    yield put(actions.deleteNameServerGroup.failure({
      loading: false,
      success: false,
      failure: false,
      error: err as ApiError,
      data: null
    } as DeleteResponse<string | null>));
  }
}

export default function* sagas(): Generator {
  yield all([
    takeLatest(actions.getNameServerGroup.request, getNameServerGroup),
    takeLatest(actions.saveNameServerGroup.request, saveNameServerGroup),
    takeLatest(actions.deleteNameServerGroup.request, deleteNameServerGroup)
  ]);
}
