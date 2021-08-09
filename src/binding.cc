#include <napi.h>
#include <interception.h>

using namespace Napi;

class WaitWorker : public AsyncWorker {
  public:
    WaitWorker(Promise::Deferred promise, InterceptionContext context, long milliseconds = -1)
      : AsyncWorker(promise.Env()), promise(promise), context(context), milliseconds(milliseconds), device(0) {}
    ~WaitWorker() {}
  
    void Execute() {
      if (milliseconds < 0) device = interception_wait(context);
      else device = interception_wait_with_timeout(context, milliseconds);
    }

    void OnOK() {
      if (device == 0) promise.Resolve(Env().Null());
      else promise.Resolve(Number::New(Env(), device));
    }
  
  private:
    Promise::Deferred promise;
    InterceptionContext context;
    InterceptionDevice device;
    long milliseconds;
};

void finalizeContext(Env env, InterceptionContext* context) {
  if (*context == nullptr) return;

  interception_set_filter(context, interception_is_keyboard, INTERCEPTION_FILTER_KEY_NONE);
  interception_set_filter(context, interception_is_mouse, INTERCEPTION_FILTER_MOUSE_NONE);
  interception_destroy_context(*context);
}

Value CreateContext(const CallbackInfo& info) {
  Env env = info.Env();

  InterceptionContext* context = new InterceptionContext;
  *context = interception_create_context();

  return External<InterceptionContext>::New(env, context, finalizeContext);
}

void DestroyContext(const CallbackInfo& info) {
  Env env = info.Env();

  if (info.Length() < 1) throw TypeError::New(env, "Wrong number of arguments");
  if (!info[0].IsExternal()) throw TypeError::New(env, "Invalid 'context' value");

  InterceptionContext* context = info[0].As<External<InterceptionContext>>().Data();

  interception_set_filter(*context, interception_is_keyboard, INTERCEPTION_FILTER_KEY_NONE);
  interception_set_filter(*context, interception_is_mouse, INTERCEPTION_FILTER_MOUSE_NONE);
  interception_destroy_context(*context);

  *context = nullptr;
}

Value GetPrecedence(const CallbackInfo& info) {
  Env env = info.Env();

  if (info.Length() < 2) throw TypeError::New(env, "Wrong number of arguments");
  if (!info[0].IsExternal()) throw TypeError::New(env, "Invalid 'context' value");
  if (!info[1].IsNumber()) throw TypeError::New(env, "Invalid 'device' value");

  InterceptionContext context = *info[0].As<External<InterceptionContext>>().Data();
  InterceptionDevice device = info[1].As<Number>().Uint32Value();

  InterceptionPrecedence precedence = interception_get_precedence(context, device);
  return Number::New(env, precedence);
}

void SetPrecedence(const CallbackInfo& info) {
  Env env = info.Env();

  if (info.Length() < 3) throw TypeError::New(env, "Wrong number of arguments");
  if (!info[0].IsExternal()) throw TypeError::New(env, "Invalid 'context' value");
  if (!info[1].IsNumber()) throw TypeError::New(env, "Invalid 'device' value");
  if (!info[2].IsNumber()) throw TypeError::New(env, "Invalid 'precedence' value");

  InterceptionContext context = *info[0].As<External<InterceptionContext>>().Data();
  InterceptionDevice device = info[1].As<Number>().Uint32Value();
  InterceptionPrecedence precedence = info[2].As<Number>().Uint32Value();

  interception_set_precedence(context, device, precedence);
}

Value GetFilter(const CallbackInfo& info) {
  Env env = info.Env();

  if (info.Length() < 2) throw TypeError::New(env, "Wrong number of arguments");
  if (!info[0].IsExternal()) throw TypeError::New(env, "Invalid 'context' value");
  if (!info[1].IsNumber()) throw TypeError::New(env, "Invalid 'device' value");

  InterceptionContext context = *info[0].As<External<InterceptionContext>>().Data();
  InterceptionDevice device = info[1].As<Number>().Uint32Value();

  InterceptionFilter filter = interception_get_filter(context, device);
  return Number::New(env, filter);
}

void SetFilter(const CallbackInfo& info) {
  Env env = info.Env();

  if (info.Length() < 3) throw TypeError::New(env, "Wrong number of arguments");
  if (!info[0].IsExternal()) throw TypeError::New(env, "Invalid 'context' value");
  if (!info[1].IsString()) throw TypeError::New(env, "Invalid 'predicate' value");
  if (!info[2].IsNumber()) throw TypeError::New(env, "Invalid 'filter' value");

  InterceptionContext context = *info[0].As<External<InterceptionContext>>().Data();

  InterceptionPredicate predicate = nullptr;
  std::string predicateName = info[1].As<String>().Utf8Value();

  if (predicateName == "keyboard") predicate = interception_is_keyboard;
  else if (predicateName == "mouse") predicate = interception_is_mouse;
  else if (predicateName == "invalid") predicate = interception_is_invalid;
  else throw TypeError::New(env, "Invalid 'predicate' value");

  InterceptionFilter filter = info[2].As<Number>().Uint32Value();

  interception_set_filter(context, predicate, filter);
}

Value Wait(const CallbackInfo& info) {
  Env env = info.Env();

  if (info.Length() < 1) throw TypeError::New(env, "Wrong number of arguments");
  if (!info[0].IsExternal()) throw TypeError::New(env, "Invalid 'context' value");

  InterceptionContext context = *info[0].As<External<InterceptionContext>>().Data();
  InterceptionDevice device = interception_wait(context);

  if (device == 0) return env.Null();
  else return Number::New(env, device);
}

Value WaitAsync(const CallbackInfo& info) {
  Env env = info.Env();

  if (info.Length() < 1) throw TypeError::New(env, "Wrong number of arguments");
  if (!info[0].IsExternal()) throw TypeError::New(env, "Invalid 'context' value");

  InterceptionContext context = *info[0].As<External<InterceptionContext>>().Data();
  Promise::Deferred promise = Promise::Deferred::New(env);

  WaitWorker* waitWorker = new WaitWorker(promise, context);
  waitWorker->Queue();

  return promise.Promise();
}

Value WaitWithTimeout(const CallbackInfo& info) {
  Env env = info.Env();

  if (info.Length() < 2) throw TypeError::New(env, "Wrong number of arguments");
  if (!info[0].IsExternal()) throw TypeError::New(env, "Invalid 'context' value");
  if (!info[1].IsNumber()) throw TypeError::New(env, "Invalid 'timeout' value");

  InterceptionContext context = *info[0].As<External<InterceptionContext>>().Data();
  unsigned long timeout = info[1].As<Number>().Uint32Value();

  InterceptionDevice device = interception_wait_with_timeout(context, timeout);

  if (device == 0) return env.Null();
  else return Number::New(env, device);
}

Value WaitWithTimeoutAsync(const CallbackInfo& info) {
  Env env = info.Env();

  if (info.Length() < 2) throw TypeError::New(env, "Wrong number of arguments");
  if (!info[0].IsExternal()) throw TypeError::New(env, "Invalid 'context' value");
  if (!info[1].IsNumber()) throw TypeError::New(env, "Invalid 'timeout' value");

  InterceptionContext context = *info[0].As<External<InterceptionContext>>().Data();
  unsigned long timeout = info[1].As<Number>().Uint32Value();
  Promise::Deferred promise = Promise::Deferred::New(env);

  WaitWorker* waitWorker = new WaitWorker(promise, context, timeout);
  waitWorker->Queue();

  return promise.Promise();
}


Object wrapStroke(Env& env, InterceptionStroke& stroke, InterceptionDevice device) {
  Object obj = Object::New(env);

  if (interception_is_keyboard(device)) {
    InterceptionKeyStroke &kstroke = *(InterceptionKeyStroke *) &stroke;

    obj.Set("type", "keyboard");
    obj.Set("code", kstroke.code);
    obj.Set("state", kstroke.state);
    obj.Set("information", kstroke.information);
  } else if (interception_is_mouse(device)) {
    InterceptionMouseStroke &mstroke = *(InterceptionMouseStroke *) &stroke;

    obj.Set("type", "mouse");
    obj.Set("state", mstroke.state);
    obj.Set("flags", mstroke.flags);
    obj.Set("rolling", mstroke.rolling);
    obj.Set("x", mstroke.x);
    obj.Set("y", mstroke.y);
    obj.Set("information", mstroke.information);
  } else {
    obj.Set("type", "invalid");
  }

  return obj;
}

void unwrapStroke(Env& env, Object& obj, InterceptionStroke& stroke) {
  std::string type = obj.Get("type").ToString().Utf8Value();

  if (type == "keyboard") {
    InterceptionKeyStroke &kstroke = *(InterceptionKeyStroke *) &stroke;

    kstroke.code = obj.Get("code").ToNumber().Uint32Value();
    kstroke.state = obj.Get("state").ToNumber().Uint32Value();
    kstroke.information = obj.Get("information").ToNumber().Uint32Value();
  } else if (type == "mouse") {
    InterceptionMouseStroke &mstroke = *(InterceptionMouseStroke *) &stroke;

    mstroke.state = obj.Get("state").ToNumber().Uint32Value();
    mstroke.flags = obj.Get("flags").ToNumber().Uint32Value();
    mstroke.rolling = obj.Get("rolling").ToNumber().Int32Value();
    mstroke.x = obj.Get("x").ToNumber().Int32Value();
    mstroke.y = obj.Get("y").ToNumber().Int32Value();
    mstroke.information = obj.Get("information").ToNumber().Uint32Value();
  } else {
    throw TypeError::New(env, "Invalid stroke type");
  }
}

Value Send(const CallbackInfo& info) {
  Env env = info.Env();

  if (info.Length() < 4) throw TypeError::New(env, "Wrong number of arguments");
  if (!info[0].IsExternal()) throw TypeError::New(env, "Invalid 'context' value");
  if (!info[1].IsNumber()) throw TypeError::New(env, "Invalid 'device' value");
  if (!info[2].IsObject()) throw TypeError::New(env, "Invalid 'stroke' value");
  if (!info[3].IsNumber()) throw TypeError::New(env, "Invalid 'nstroke' value");

  InterceptionContext context = *info[0].As<External<InterceptionContext>>().Data();
  InterceptionDevice device = info[1].As<Number>().Uint32Value();
  InterceptionDevice nstroke = info[3].As<Number>().Uint32Value();

  InterceptionStroke stroke;
  Object strokeObj = info[2].As<Object>();
  unwrapStroke(env, strokeObj, stroke);

  int status = interception_send(context, device, &stroke, nstroke);
  return Boolean::New(env, status ? true : false);
}

Value Receive(const CallbackInfo& info) {
  Env env = info.Env();

  if (info.Length() < 3) throw TypeError::New(env, "Wrong number of arguments");
  if (!info[0].IsExternal()) throw TypeError::New(env, "Invalid 'context' value");
  if (!info[1].IsNumber()) throw TypeError::New(env, "Invalid 'device' value");
  if (!info[2].IsNumber()) throw TypeError::New(env, "Invalid 'nstroke' value");

  InterceptionContext context = *info[0].As<External<InterceptionContext>>().Data();
  InterceptionDevice device = info[1].As<Number>().Uint32Value();
  InterceptionDevice nstroke = info[2].As<Number>().Uint32Value();

  InterceptionStroke stroke;
  int status = interception_receive(context, device, &stroke, nstroke);

  if (status == 0) return env.Null();
  return wrapStroke(env, stroke, device);
}

Value GetHardwareId(const CallbackInfo& info) {
  Env env = info.Env();

  if (info.Length() < 2) throw TypeError::New(env, "Wrong number of arguments");
  if (!info[0].IsExternal()) throw TypeError::New(env, "Invalid 'context' value");
  if (!info[1].IsNumber()) throw TypeError::New(env, "Invalid 'device' value");

  InterceptionContext context = *info[0].As<External<InterceptionContext>>().Data();
  InterceptionDevice device = info[1].As<Number>().Uint32Value();
  char16_t rawHardwareId[500];

  size_t length = interception_get_hardware_id(context, device, rawHardwareId, sizeof(rawHardwareId));
  if (length <= 0 || length > sizeof(rawHardwareId)) return env.Null();
  return String::New(env, rawHardwareId, length >> 1);
}

Value IsInvalid(const CallbackInfo& info) {
  Env env = info.Env();

  if (info.Length() < 1) throw TypeError::New(env, "Wrong number of arguments");
  if (!info[0].IsNumber()) throw TypeError::New(env, "Invalid 'device' value");

  InterceptionDevice device = info[0].As<Number>().Uint32Value();
  int result = interception_is_invalid(device);

  return Boolean::New(env, result ? true : false);
}

Value IsKeyboard(const CallbackInfo& info) {
  Env env = info.Env();

  if (info.Length() < 1) throw TypeError::New(env, "Wrong number of arguments");
  if (!info[0].IsNumber()) throw TypeError::New(env, "Invalid 'device' value");

  InterceptionDevice device = info[0].As<Number>().Uint32Value();
  int result = interception_is_keyboard(device);

  return Boolean::New(env, result ? true : false);
}

Value IsMouse(const CallbackInfo& info) {
  Env env = info.Env();

  if (info.Length() < 1) throw TypeError::New(env, "Wrong number of arguments");
  if (!info[0].IsNumber()) throw TypeError::New(env, "Invalid 'device' value");

  InterceptionDevice device = info[0].As<Number>().Uint32Value();
  int result = interception_is_mouse(device);

  return Boolean::New(env, result ? true : false);
}

Object Init(Env env, Object exports) {
  exports.Set("createContext", Function::New<CreateContext>(env, "interception_create_context"));
  exports.Set("destroyContext", Function::New<DestroyContext>(env, "interception_destroy_context"));
  exports.Set("getPrecedence", Function::New<GetPrecedence>(env, "interception_get_precedence"));
  exports.Set("setPrecedence", Function::New<SetPrecedence>(env, "interception_set_precedence"));
  exports.Set("getFilter", Function::New<GetFilter>(env, "interception_get_filter"));
  exports.Set("setFilter", Function::New<SetFilter>(env, "interception_set_filter"));
  exports.Set("wait", Function::New<Wait>(env, "interception_wait"));
  exports.Set("waitAsync", Function::New<WaitAsync>(env, "node_interception_wait_async"));
  exports.Set("waitWithTimeout", Function::New<WaitWithTimeout>(env, "interception_wait_with_timeout"));
  exports.Set("waitWithTimeoutAsync", Function::New<WaitWithTimeoutAsync>(env, "node_interception_wait_with_timeout_async"));
  exports.Set("send", Function::New<Send>(env, "interception_send"));
  exports.Set("receive", Function::New<Receive>(env, "interception_receive"));
  exports.Set("getHardwareId", Function::New<GetHardwareId>(env, "interception_get_hardware_id"));
  exports.Set("isInvalid", Function::New<IsInvalid>(env, "interception_is_invalid"));
  exports.Set("isKeyboard", Function::New<IsKeyboard>(env, "interception_is_keyboard"));
  exports.Set("isMouse", Function::New<IsMouse>(env, "interception_is_mouse"));

  return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init);
