from kafka import KafkaConsumer

def NewKafkaConsumer(topic: str, group_id : str, auto_offset_reset : str = 'earliest', enable_auto_commit : bool = True, *args, **kwargs) -> KafkaConsumer:
    consumer = KafkaConsumer(**kwargs)
    return consumer