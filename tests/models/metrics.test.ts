import { describe, it, expect } from "vitest";
import { metricPayloadSchema, metricTypeEnum } from "../../src/models/metrics";

describe("metricPayloadSchema", () => {
  it("accepts valid metrics", () => {
    const result = metricPayloadSchema.safeParse({
      source_id: 1,
      metric_type: "response_time",
      value: 100,
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid metrics with timestamp", () => {
    const result = metricPayloadSchema.safeParse({
      source_id: 1,
      metric_type: "response_time",
      value: 100,
      timestamp: "2022-01-01T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty object", () => {
    const result = metricPayloadSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects null input", () => {
    const result = metricPayloadSchema.safeParse(null);
    expect(result.success).toBe(false);
  });

  it("rejects undefined input", () => {
    const result = metricPayloadSchema.safeParse(undefined);
    expect(result.success).toBe(false);
  });

  it("strips extra fields", () => {
    const result = metricPayloadSchema.safeParse({
      source_id: 1,
      metric_type: "response_time",
      value: 100,
      extra: "extra",
    });
    expect(result.success).toBe(true);
  });

  //source_id
  it("rejects non-number source_id", () => {
    const result = metricPayloadSchema.safeParse({
      source_id: "1",
      metric_type: "response_time",
      value: 100,
    });
    expect(result.success).toBe(false);
  });
  it("rejects negative source_id", () => {
    const result = metricPayloadSchema.safeParse({
      source_id: -1,
      metric_type: "response_time",
      value: 100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer source_id", () => {
    const result = metricPayloadSchema.safeParse({
      source_id: 1.5,
      metric_type: "response_time",
      value: 100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero source_id", () => {
    const result = metricPayloadSchema.safeParse({
      source_id: 0,
      metric_type: "response_time",
      value: 100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing source_id", () => {
    const result = metricPayloadSchema.safeParse({
      metric_type: "response_time",
      value: 100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects undefined source_id", () => {
    const result = metricPayloadSchema.safeParse({
      source_id: undefined,
      metric_type: "response_time",
      value: 100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects null source_id", () => {
    const result = metricPayloadSchema.safeParse({
      source_id: null,
      metric_type: "response_time",
      value: 100,
    });
    expect(result.success).toBe(false);
  });

  //metric_type

  metricTypeEnum.options.forEach((type) => {
    it(`accepts '${type}' as a valid metric_type`, () => {
      const result = metricPayloadSchema.safeParse({
        source_id: 1,
        metric_type: type,
        value: 100,
      });
      expect(result.success).toBe(true);
    });
  });

  it("rejects invalid metric types", () => {
    const result = metricPayloadSchema.safeParse({
      source_id: 1,
      metric_type: "invalid",
      value: 100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing metric_type", () => {
    const result = metricPayloadSchema.safeParse({
      source_id: 1,
      value: 100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects undefined metric_type", () => {
    const result = metricPayloadSchema.safeParse({
      source_id: 1,
      metric_type: undefined,
      value: 100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects null metric_type", () => {
    const result = metricPayloadSchema.safeParse({
      source_id: 1,
      metric_type: null,
      value: 100,
    });
    expect(result.success).toBe(false);
  });

  //value
  it("rejects negative value", () => {
    const result = metricPayloadSchema.safeParse({
      source_id: 1,
      metric_type: "response_time",
      value: -1,
    });
    expect(result.success).toBe(false);
  });

  it("accepts zero value", () => {
    const result = metricPayloadSchema.safeParse({
      source_id: 1,
      metric_type: "response_time",
      value: 0,
    });
    expect(result.success).toBe(true);
  });

  it("accepts float value", () => {
    const result = metricPayloadSchema.safeParse({
      source_id: 1,
      metric_type: "response_time",
      value: 100.5,
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-number value", () => {
    const result = metricPayloadSchema.safeParse({
      source_id: 1,
      metric_type: "response_time",
      value: "100",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing value", () => {
    const result = metricPayloadSchema.safeParse({
      source_id: 1,
      metric_type: "response_time",
    });
    expect(result.success).toBe(false);
  });

  it("rejects undefined value", () => {
    const result = metricPayloadSchema.safeParse({
      source_id: 1,
      metric_type: "response_time",
      value: undefined,
    });
    expect(result.success).toBe(false);
  });

  it("rejects null value", () => {
    const result = metricPayloadSchema.safeParse({
      source_id: 1,
      metric_type: "response_time",
      value: null,
    });
    expect(result.success).toBe(false);
  });

  //timestamp
  it("accepts valid timestamp", () => {
    const result = metricPayloadSchema.safeParse({
      source_id: 1,
      metric_type: "response_time",
      value: 100,
      timestamp: "2022-01-01T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("accepts undefined timestamp", () => {
    const result = metricPayloadSchema.safeParse({
      source_id: 1,
      metric_type: "response_time",
      value: 100,
      timestamp: undefined,
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-string timestamp", () => {
    const result = metricPayloadSchema.safeParse({
      source_id: 1,
      metric_type: "response_time",
      value: 100,
      timestamp: 1234567890,
    });
    expect(result.success).toBe(false);
  });

  it("rejects null timestamp", () => {
    const result = metricPayloadSchema.safeParse({
      source_id: 1,
      metric_type: "response_time",
      value: 100,
      timestamp: null,
    });
    expect(result.success).toBe(false);
  });
});
