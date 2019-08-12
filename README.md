# boom

HTTP-friendly error objects

[![Build Status](https://travis-ci.org/hapijs/boom.svg?branch=v5-commercial)](https://travis-ci.org/hapijs/boom)

## License

This version of the package requires a commercial license. You may not use, copy, or distribute it without first acquiring a commercial license from Sideway Inc. Using this software without a license is a violation of US and international law. To obtain a license, please contact [sales@sideway.com](mailto:sales@sideway.com). The open source version of this package can be found [here](https://github.com/hapijs/boom).

## Documentation

[**API Reference**](API.md)

## F.A.Q.

**Q** How do I include extra information in my responses? `output.payload` is missing `data`, what gives?

**A** There is a reason the values passed back in the response payloads are pretty locked down. It's mostly for security and to not leak any important information back to the client. This means you will need to put in a little more effort to include extra information about your custom error. Check out the ["Error transformation"](https://github.com/hapijs/hapi/blob/master/API.md#error-transformation) section in the hapi documentation.

---
