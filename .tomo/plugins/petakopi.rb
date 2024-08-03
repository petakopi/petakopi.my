def tasks
  command = settings[:run_args]&.first

  if command.nil?
    puts "Usage: tomo run -- petakopi:tasks <command>"
    return
  end

  remote.rails(command)
end
