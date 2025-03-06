from kafka import KafkaConsumer

def NewKafkaProducer(topic: str, group_id : str, auto_offset_reset : str = 'earliest', enable_auto_commit : bool = True) -> KafkaConsumer:
    consumer = KafkaConsumer(
        topic=topic,
        group_id=group_id,
        bootstrap_servers=['localhost:9092'],
        auto_offset_reset=auto_offset_reset,
        enable_auto_commit=True
    )