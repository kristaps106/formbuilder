<?php

/**
 * Class NotificationHandler
 *
 * creates notification on any models object create/update/delete
 */
class NotificationHandler
{
	protected $follow_objects = '*';

	public function     following( $instance_type )
	{
		return $this->follow_objects == '*' ? TRUE : in_array( $instance_type, explode( ',', $this->follow_objects ) );
	}


	public function     onObjectUpdate( $object )
	{
		$instance_type = get_class( $object );
		if ( $this->following( $instance_type ) )
		{
			$this->update( $object );
		}
	}
	public function     onObjectCreate( $object )
	{
		$instance_type = get_class( $object );
		if ( $this->following( $instance_type ) )
		{
			$this->create( $object );
		}
	}



    /**
     * Handles update event
     *
     * @param object $object
     */
	protected function      update( $object )
	{
		Notification::$template = 'notifications/components/update_description';
		$old_values = $object->getOriginal();
		$new_values = $object->getAttributes();
		$changed = array_diff_assoc( $new_values, $old_values );
		$users = $this->getRecipients( $object, $changed, 'update' );
		if ( ! empty( $users ) && ! empty( $object->instance_id ) )
		{
			Notification::create_bulk( [
				'object' => $object,
				'actor' => Auth::user(),
				'old_values' => $old_values,
				'new_values' => $new_values,
				'changed' => $changed
			], $users );
		}
	}

    /**
     * Handles create event
     *
     * @param object $object
     */
    protected function      create( $object )
	{
		Notification::$template = 'notifications/components/create_description';
		$changed = $object->getAttributes();
		$users = $this->getRecipients( $object, $changed, 'create' );
		$actor = Auth::user();
		if ( ! empty( $users ) && ! empty( $actor ) && ! empty( $object->instance_id ) )
		{
			Notification::create_bulk( [
				'object' => $object,
				'actor' => $actor,
				'new_values' => $changed,
			], $users );
		}
	}

    /**
     * Requests changed/deleted model for users list to be notified
     *
     * @param object $object
     * @param array $data_updated
     * @param string $action
     * @return Collection|null
     */
    protected function      getRecipients( $object, $data_updated, $action )
	{
		$instance_type = get_class( $object );
		// if class have static getUsersToNotify envoke it returning recipients collection
		if ( method_exists( $instance_type, 'getUsersToNotify' ) )
		{
			return $instance_type::getUsersToNotify( $object, $data_updated, $action );
		}
		return NULL;
	}

}