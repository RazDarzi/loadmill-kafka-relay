import { Kafka, Partitioners, RecordMetadata } from "kafkajs";
import { ProduceOptions } from "../types";
import { prepareBrokers } from "./brokers";
import { encode } from "./schema-registry";

export const produceMessage = async ({ brokers, topic, message, sasl, ssl }: ProduceOptions): Promise<RecordMetadata> => {
  const kafka = new Kafka({
    clientId: 'loadmill-kafka-client',
    brokers: prepareBrokers(brokers),
    sasl,
    ssl,
  });
  const producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner,
  });
  await producer.connect();
  const [recordMetaData] = await producer.send({
    topic,
    messages: [
      { value: await encode(message) || JSON.stringify(message) },
    ],
  });
  await producer.disconnect();
  return recordMetaData;
};
